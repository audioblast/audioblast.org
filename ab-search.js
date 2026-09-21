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

/**
 * A lookup a plugin remembers from one search to the next, so the same thing is only asked about
 * once however many searches ask about it.
 *
 * A request a newer query cancels gives an empty answer rather than an error, and that emptiness is
 * not an answer: remembered, it would be handed to every later search for the same thing. So an
 * entry is dropped as its search is cancelled, before anything can read it, and is kept for good
 * once its answer has arrived. A search that starts while an answer is still being waited on shares
 * the wait; one that starts by cancelling that wait asks again.
 *
 * @param  {Object} search the search the lookup belongs to
 * @param  {Map} held what the plugin has already looked up
 * @param  {String} key what is being looked up
 * @param  {Function} ask makes the promise of the answer, called only when it is not already held
 * @return {Promise} the answer
 */
const searchCache = function(search, held, key, ask) {
  //A recogniser runs on to the end of its turn after its search has been cancelled, as the core
  //only drops the search between one plugin and the next. What it asks for then is asked of a
  //cancelled request and comes back empty, so it is answered but never remembered.
  if (search.signal.aborted) {
    return(held.has(key) ? held.get(key) : ask());
  }
  if (!held.has(key)) {
    const answer = ask();
    const forget = function() {
      //Only this answer: a later search may already have asked again under the same key
      if (held.get(key) === answer) {
        held.delete(key);
      }
      search.signal.removeEventListener("abort", forget);
    };
    held.set(key, answer);
    search.signal.addEventListener("abort", forget);
    answer.then(() => search.signal.removeEventListener("abort", forget), forget);
  }
  return(held.get(key));
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

//What the links table says a row is the subject matter of
const IS_ABOUT = "http://purl.obolibrary.org/obo/IAO_0000136";

/**
 * The rows of a module that are about a taxon.
 *
 * A description or a reference says what it is about through the links table rather than through a
 * column of its own, and the link names the taxon by its id at a source. A name is held by every
 * source that knows it and only some of those sources link to anything, so every row the name is
 * held at is tried. The qualifier of the link is kept with the row it led to, as that is where a
 * reference says what it holds for this taxon and not merely that it treats it.
 *
 * Nothing rolls up: a link is to one taxon, so asking about a genus gives what is about the genus
 * itself and not what is about each of its species.
 *
 * Shared by Fabre and Sherborn, which read two modules the same way.
 *
 * @param  {Object} search the search the lookups belong to
 * @param  {Object} plugin the plugin, which holds what it has already looked up
 * @param  {String} module the module whose rows are wanted, e.g. descriptions
 * @param  {Object} taxon the taxon annotation the rows are to be about
 * @return {Promise} the rows, each with the qualifiers of the links that led to it
 */
const aboutTaxon = function(search, plugin, module, taxon) {
  const held = module+"/"+taxon.classification["taxon"];
  return(searchCache(search, plugin.asked, held, () => aboutTaxonRows(search, plugin, module, taxon)));
}

//The lookups themselves, held by aboutTaxon so that each taxon is followed only once
const aboutTaxonRows = async function(search, plugin, module, taxon) {
  const name = taxon.classification["taxon"];
  //The request Linnaeus made of this name, so the browser answers it from its cache
  const rows = await searchFetch(search, AB_API_BASE+"/data/taxa/?taxon="+encodeURIComponent(name)+"&output=nakedJSON");
  if (!Array.isArray(rows)) {
    return([]);
  }
  //Only the sources that hold the name at the rank it was taken at: one holding it as a complex,
  //say, is a different thing that happens to be written the same way
  const taxa = rows.filter(row => row != null && typeof row["rank"] == "string"
    && row["rank"].toLowerCase() == taxon.rank);
  const answers = await Promise.all(taxa.map(row => searchFetch(search, AB_API_BASE+"/data/links/"
    +"?subject_type="+encodeURIComponent(module)
    +"&object_type=taxa"
    +"&object_source="+encodeURIComponent(row["source"])
    +"&object_id="+encodeURIComponent(row["id"])
    +"&predicate="+encodeURIComponent(IS_ABOUT)
    +"&page_size="+encodeURIComponent(plugin.maxRows)
    +"&output=nakedJSON")));

  //A row is linked once for each thing it holds for the taxon, so the links are gathered by the
  //row they point at and their qualifiers kept together
  const wanted = new Map();
  answers.filter(answer => Array.isArray(answer)).flat().forEach(link => {
    if (link == null || link["subject_source"] == null || link["subject_id"] == null) {
      return;
    }
    const key = link["subject_source"]+"/"+link["subject_id"];
    if (!wanted.has(key)) {
      wanted.set(key, {source: link["subject_source"], id: link["subject_id"], qualifiers: []});
    }
    const qualifiers = wanted.get(key).qualifiers;
    if (typeof link["qualifier"] == "string" && link["qualifier"] != "" && !qualifiers.includes(link["qualifier"])) {
      qualifiers.push(link["qualifier"]);
    }
  });

  //One request each, as a module is filtered by one id at a time
  const found = await Promise.all(Array.from(wanted.values()).slice(0, plugin.maxRows).map(async one => {
    const answer = await searchFetch(search, AB_API_BASE+"/data/"+encodeURIComponent(module)+"/"
      +"?source="+encodeURIComponent(one.source)
      +"&id="+encodeURIComponent(one.id)
      +"&output=nakedJSON");
    if (!Array.isArray(answer)) {
      return(null);
    }
    //By its source as well as its id, as a module is filtered by a source the name is part of
    const row = answer.find(held => held != null && held["source"] == one.source);
    return((row == null) ? null : Object.assign({qualifiers: one.qualifiers}, row));
  }));
  return(found.filter(row => row != null));
}

/**
 * A heading naming a taxon, with the name in italics where it is one that is written that way
 * @param  {String} lead what is being shown of it, e.g. "Descriptions of"
 * @param  {Object} taxon the taxon annotation
 * @return {Node} the heading
 */
const taxonHeading = function(lead, taxon) {
  const heading = document.createElement("h2");
  heading.appendChild(document.createTextNode(lead+" "+taxon.rank+" "));
  const name = taxon.classification["taxon"];
  if (["genus", "species"].includes(taxon.rank)) {
    const italic = document.createElement("i");
    italic.textContent = name;
    heading.appendChild(italic);
  } else {
    heading.appendChild(document.createTextNode(name));
  }
  return(heading);
}

/**
 * The name of a vocabulary term as words, read from the CamelCase at the end of its address: one
 * ending DiagnosticDescription gives "Diagnostic description". A run of capitals is left as it is,
 * so StridulatoryFileSEMImage gives "Stridulatory file SEM image".
 *
 * Read from the address because the controlled vocabularies that the topics of descriptions and
 * the contents of references belong to do not resolve, so there is no label to ask them for.
 *
 * @param  {String} term the term's address, or the part of it after the #
 * @return {String} the name as words
 */
const termWords = function(term) {
  const words = String(term || "").split("#").pop()
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .split(/\s+/)
    .filter(word => word != "");
  //Lower case after the first word, but not a word that is written as an acronym
  return(words.map((word, i) => (i == 0 || word == word.toUpperCase()) ? word : word.toLowerCase()).join(" "));
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
  const answers = await Promise.all(asked.map(phrase =>
    searchCache(search, plugin.searches, phrase, () =>
      searchFetch(search, vocabulary+"/api/search/?q="+encodeURIComponent(phrase)))));

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
    term.definition = await searchCache(search, plugin.definitions, term.uri, () =>
      fetch(term.uri, {headers: {Accept: "application/ld+json"}, signal: search.signal})
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
