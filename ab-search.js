/*
The core of searchAB.

A search is a query together with the annotations plugins have recognised in it. A plugin changes
nothing itself: its recogniser is handed the search and returns what it found, and the core merges
that in and runs the recognisers again until nothing new appears. That loop, rather than the order
the plugin files happen to load in, is what settles the result, so no plugin has to know which
other plugin runs before it.

An annotation is an object rather than a string, so a name carrying a quote or a colon travels
through unharmed: most of a taxon's vernacular names have an apostrophe in some language.

Each search is a generation. Work belonging to an older one is dropped instead of racing the new
one, and the requests it is waiting on are cancelled, so a plugin never has to recognise its own
stale answers.
*/

const searchAB = {
  name: "audioBLAST",
  consoleContainer: null,
  infoContainer: null,
  contentContainer: null,
  plugins: [],
  //The elements each plugin renders into, by plugin name
  boxes: {},
  generation: 0,
  controller: null,
  //A recogniser may react to what another one found, so the loop runs again until the annotations
  //settle. Capped, in case two plugins ever answer each other forever.
  maxPasses: 6,
  urlParams: new URLSearchParams(window.location.search),

  setConsoleContainerId(container) {
    this.consoleContainer = container;
  },
  setInfoContainerId(container) {
    this.infoContainer = container;
  },
  setContentContainerId(container) {
    this.contentContainer = container;
  },

  consoleLog(plugin, message) {
    const container = (this.consoleContainer == null) ? null : document.getElementById(this.consoleContainer);
    if (container) {
      container.appendChild(document.createTextNode("["+plugin+"] "+message));
      container.appendChild(document.createElement("br"));
    }
  },

  /**
   * Register a plugin and make the boxes it asks for. A plugin names its boxes but never looks
   * them up: the core hands it the elements to fill.
   */
  addPlugin(plugin) {
    if (plugin == null || typeof plugin.name != "string") {
      return;
    }
    this.plugins.push(plugin);
    this.boxes[plugin.name] = {};
    if (typeof plugin.boxes != "function") {
      return;
    }
    const wanted = plugin.boxes();
    const containers = {info: this.infoContainer, content: this.contentContainer};
    Object.keys(containers).forEach(kind => {
      if (!(kind in wanted)) {
        return;
      }
      const parent = (containers[kind] == null) ? null : document.getElementById(containers[kind]);
      if (parent == null) {
        return;
      }
      const box = document.createElement("div");
      box.id = wanted[kind];
      box.className = "feature";
      box.style.display = "none";
      parent.appendChild(box);
      this.boxes[plugin.name][kind] = box;
    });
  },

  /**
   * Everything the plugins know about one query
   */
  makeSearch(query, signal) {
    const core = this;
    return {
      query: query,
      annotations: [],
      signal: signal,
      //Whether anything of a kind was recognised, e.g. whether the query named a trait
      has(type) {
        return this.annotations.some(annotation => annotation.type == type);
      },
      of(type) {
        return this.annotations.filter(annotation => annotation.type == type);
      },
      //The part of the query no plugin has accounted for, which is what the ones that read words
      //rather than tags work on
      remaining() {
        let text = this.query;
        this.annotations.forEach(annotation => {
          if (typeof annotation.text != "string" || annotation.text.trim() == "") {
            return;
          }
          const at = text.toLowerCase().indexOf(annotation.text.toLowerCase());
          if (at >= 0) {
            text = text.slice(0, at) + " " + text.slice(at + annotation.text.length);
          }
        });
        return text.replace(/\s+/g, " ").trim();
      },
      describe(annotation) {
        return core.describe(annotation);
      }
    };
  },

  /**
   * What names an annotation, so that two recognisers finding the same thing find one annotation
   * and not two. A later one that knows more, such as the rank of a taxon, adds to it.
   */
  key(annotation) {
    switch (annotation.type) {
      case "taxon":
        return "taxon/"+annotation.value;
      case "trait":
        return "trait/"+annotation.trait;
      case "traitValue":
        return "traitValue/"+annotation.value;
      case "namedTraitValue":
        return "namedTraitValue/"+annotation.label;
      case "vernacular":
        return "vernacular/"+annotation.value;
      case "vocabTerm":
        return "vocabTerm/"+annotation.uri;
      case "glossaryTerm":
        return "glossaryTerm/"+annotation.uri;
      default:
        return annotation.type+"/"+JSON.stringify(annotation);
    }
  },

  describe(annotation) {
    switch (annotation.type) {
      case "taxon":
        return (annotation.rank == null) ? "taxon "+annotation.value : annotation.rank+" "+annotation.value;
      case "trait":
        return "trait "+annotation.trait;
      case "traitValue":
        return "trait value "+annotation.value;
      case "namedTraitValue":
        return annotation.label+" ("+annotation.trait+" = "+annotation.value+")";
      case "vernacular":
        return "the name "+annotation.value;
      case "vocabTerm":
      case "glossaryTerm":
        return "the term "+annotation.name;
      default:
        return annotation.type;
    }
  },

  /**
   * Merge what a recogniser found into the search
   * @return {Boolean} whether anything was new
   */
  add(search, found, by) {
    let changed = false;
    if (!Array.isArray(found)) {
      return(false);
    }
    found.forEach(annotation => {
      if (annotation == null || typeof annotation.type != "string") {
        return;
      }
      const key = this.key(annotation);
      const existing = search.annotations.find(other => this.key(other) == key);
      if (existing == null) {
        search.annotations.push(Object.assign({by: by}, annotation));
        this.consoleLog(by, "Recognised "+this.describe(annotation));
        changed = true;
        return;
      }
      //Another recogniser may know more about the same thing, such as a taxon's rank
      const added = Object.keys(annotation).filter(field => existing[field] !== annotation[field]);
      if (added.length > 0) {
        Object.assign(existing, annotation);
        this.consoleLog(by, "Added "+added.join(", ")+" to "+this.describe(existing));
        changed = true;
      }
    });
    return(changed);
  },

  init() {
    const query = this.urlParams.get("search");
    if (query == null) {
      return;
    }
    this.run(query.replaceAll("?", "").trim());
  },

  /**
   * Run a query: recognise until the annotations settle, then show what was found
   */
  async run(query) {
    if (query == "") {
      return;
    }
    const generation = ++this.generation;
    if (this.controller != null) {
      this.controller.abort();
    }
    this.controller = new AbortController();
    const search = this.makeSearch(query, this.controller.signal);
    this.consoleLog(this.name, "New query: "+query);
    this.showQuery(search);
    this.loading();
    for (let pass = 0; pass < this.maxPasses; pass++) {
      let changed = false;
      for (const plugin of this.plugins) {
        if (typeof plugin.recognise != "function") {
          continue;
        }
        let found = [];
        try {
          found = await plugin.recognise(search, this);
        } catch (error) {
          this.consoleLog(plugin.name, "Could not read its source");
        }
        if (generation != this.generation) {
          return;
        }
        if (this.add(search, found, plugin.name)) {
          changed = true;
        }
      }
      if (!changed) {
        break;
      }
      if (pass + 1 == this.maxPasses) {
        this.consoleLog(this.name, "Stopped after "+this.maxPasses+" passes");
      }
    }
    this.showQuery(search);
    await this.render(search, generation);
  },

  //A box shows while its plugin is still working
  loading() {
    Object.values(this.boxes).forEach(boxes => {
      Object.values(boxes).forEach(box => {
        const dots = document.createElement("div");
        dots.className = "dot-carousel";
        box.replaceChildren(dots);
        box.style.display = "block";
      });
    });
  },

  /**
   * Fill each plugin's boxes. A box is shown if its plugin put something in it, so no plugin
   * decides whether it is visible, and none can leave an empty box on the page.
   */
  async render(search, generation) {
    for (const plugin of this.plugins) {
      const boxes = this.boxes[plugin.name] || {};
      //A plugin can say what hides it, so which box wins is settled here and not in each plugin
      const suppressed = Array.isArray(plugin.suppressedBy) && plugin.suppressedBy.some(type => search.has(type));
      if (typeof plugin.render == "function" && !suppressed) {
        try {
          await plugin.render(search, boxes, this);
        } catch (error) {
          this.consoleLog(plugin.name, "Could not show its results");
        }
      }
      if (generation != this.generation) {
        return;
      }
      Object.values(boxes).forEach(box => {
        const dots = box.querySelector(":scope > .dot-carousel");
        if (dots != null) {
          dots.remove();
        }
        box.style.display = box.hasChildNodes() ? "block" : "none";
      });
    }
  },

  //The query as it was typed, and what the plugins made of it
  showQuery(search) {
    const heading = document.getElementById("pythia-query");
    if (heading != null) {
      heading.textContent = search.query;
    }
    const terms = document.getElementById("pythia-terms");
    if (terms == null) {
      return;
    }
    const found = search.annotations.map(annotation => {
      const line = document.createElement("div");
      line.textContent = this.describe(annotation)+" — "+annotation.by;
      return line;
    });
    terms.replaceChildren(...found);
  },

  searchSuggest(element) {
    const container = document.getElementById(element);
    if (container == null) {
      return;
    }
    this.plugins.forEach(plugin => {
      if (typeof plugin.searchSuggest != "function") {
        return;
      }
      const suggestions = plugin.searchSuggest();
      if (!Array.isArray(suggestions)) {
        return;
      }
      suggestions.forEach(suggestion => {
        //A button, so the suggestion can be reached and chosen with the keyboard
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = suggestion;
        button.addEventListener("click", () => {
          const search = document.getElementById("search");
          search.value = suggestion;
          search.focus();
        });
        container.appendChild(button);
      });
    });
  }
}

/**
 * Fetch that belongs to a search: it is cancelled when a newer search starts, and an empty
 * answer is given for anything that goes wrong, so a plugin reads the result and nothing else.
 * @param  {Object} search the search the request belongs to
 * @param  {String} url address to fetch
 * @return {Promise} the parsed JSON, or null
 */
const searchFetch = function(search, url) {
  return fetch(url, {signal: search.signal})
    .then(response => response.ok ? response.json() : null)
    .catch(error => null);
}

//The ranks a classification is given at, from the highest to the lowest. A taxon is only used at
//one of these, as its rank names the field recordings and traits are filtered by, and a field the
//API doesn't know is ignored rather than refused: a taxon taken at a rank such as Complex would
//quietly show every recording as if it were that taxon's.
const TAXON_RANKS = [
  "kingdom",
  "class",
  "order",
  "suborder",
  "family",
  "subfamily",
  "tribe",
  "genus",
  "species"
];

/**
 * How many of the ranks a row of the taxa endpoint names the classification at
 */
const taxonClassified = function(row) {
  return(TAXON_RANKS.filter(rank => row != null && row[rank] != null && row[rank] != "").length);
}

/**
 * The most specific taxon the query named, at a rank that can be filtered by, so that asking
 * about a species is not answered about its genus just because the genus is part of the name
 * @param  {Object} search the search
 * @return {Object} the taxon annotation, or null
 */
const mostSpecificTaxon = function(search) {
  const classified = search.of("taxon")
    .filter(taxon => taxon.classification != null && TAXON_RANKS.includes(taxon.rank));
  if (classified.length == 0) {
    return(null);
  }
  return(classified.reduce((best, other) =>
    (TAXON_RANKS.indexOf(other.rank) > TAXON_RANKS.indexOf(best.rank)) ? other : best));
}

/**
 * The terms of a controlled vocabulary whose names, or the names of whose synonyms, are in a piece
 * of text. Each word and pair of words is looked up once, and longer names match first, so a
 * query for "calling song" gives that term and not "song" as well.
 *
 * Shared by Pollux and King Solomon's Ring, which read two different vocabularies the same way.
 *
 * @param  {Object} search the search the lookups belong to
 * @param  {Object} plugin the plugin, which holds what it has already looked up
 * @param  {String} vocabulary address of the vocabulary
 * @param  {String} text the text to read
 * @return {Promise} the terms found, each with its uri, name, any synonym, and its definition
 */
const vocabularyTerms = async function(search, plugin, vocabulary, text) {
  const words = String(text).split(/[^\p{L}\p{N}]+/u).filter(word => word != "");
  const phrases = new Set();
  words.forEach((word, i) => {
    if (word.length > 2) {
      phrases.add(word.toLowerCase());
    }
    if (i + 1 < words.length) {
      phrases.add((word+" "+words[i + 1]).toLowerCase());
    }
  });
  const asked = Array.from(phrases).slice(0, plugin.maxLookups);
  const answers = await Promise.all(asked.map(phrase => {
    if (!plugin.searches.has(phrase)) {
      plugin.searches.set(phrase, searchFetch(search, vocabulary+"/api/search/?q="+encodeURIComponent(phrase)));
    }
    return plugin.searches.get(phrase);
  }));

  const spoken = " "+words.join(" ").toLowerCase()+" ";
  let left = spoken;
  const found = [];
  answers
    .filter(answer => Array.isArray(answer))
    .flat()
    .filter(suggestion => suggestion != null && typeof suggestion.name == "string" && typeof suggestion.uri == "string" && suggestion.uri.startsWith(vocabulary+"/"))
    .map(suggestion => ({suggestion: suggestion, name: vocabularyWords(suggestion.name)}))
    .filter(candidate => candidate.name != "")
    .sort((a, b) => b.name.length - a.name.length)
    .forEach(candidate => {
      const acronym = candidate.suggestion.acronym;
      const named = left.includes(" "+candidate.name+" ");
      if (!named && !(typeof acronym == "string" && acronym != "" && words.includes(acronym))) {
        return;
      }
      if (named) {
        left = left.split(" "+candidate.name+" ").join(" | ");
      }
      if (found.some(term => term.uri == candidate.suggestion.uri) || found.length >= plugin.maxTerms) {
        return;
      }
      found.push({
        uri: candidate.suggestion.uri,
        name: (candidate.suggestion.synonym_of != null) ? candidate.suggestion.synonym_of : candidate.suggestion.name,
        synonym: (candidate.suggestion.synonym_of != null) ? candidate.suggestion.name : null
      });
    });

  //A term's address gives its definition as plain text to clients that ask for JSON-LD
  for (const term of found) {
    if (!plugin.definitions.has(term.uri)) {
      plugin.definitions.set(term.uri, fetch(term.uri, {headers: {Accept: "application/ld+json"}, signal: search.signal})
        .then(response => response.ok ? response.json() : null)
        .then(data => {
          if (data == null) {
            return(null);
          }
          const nodes = Array.isArray(data["@graph"]) ? data["@graph"] : [data];
          const node = nodes.find(one => one["@id"] == term.uri);
          return((node != null) ? vocabularyLiteral(node["skos:definition"]) : null);
        })
        .catch(error => null));
    }
    term.definition = await plugin.definitions.get(term.uri);
  }
  return(found);
}

//A name as lower case words separated by single spaces, as text is compared
const vocabularyWords = function(name) {
  return(String(name || "").toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(word => word != "").join(" "));
}

//The text of a JSON-LD literal, preferring English if there are several
const vocabularyLiteral = function(value) {
  if (Array.isArray(value)) {
    const english = value.find(item => item != null && item["@language"] == "en");
    return(vocabularyLiteral((english != null) ? english : value[0]));
  }
  if (typeof value == "string") {
    return(value);
  }
  return((value != null && typeof value["@value"] == "string") ? value["@value"] : null);
}
