/*
King Solomon's Ring (KSR) plugin for searchAB

KSR is a plugin for searchAB that processes the user's search query for traits against 
the audioBlast vocabulary.

It displays the traits box (using the traits-taxa SQL view exposed via the audioBlast
API) if matches are found.

KSR is named after the book by Konrad Lorenz, King Solomon's Ring, in which he
describes his experiments with jackdaws and their vocalisations. He describes
how he was able to identify individual jackdaws by their vocalisations and
how he was able to identify the meaning of the vocalisations.
*/

const kingSolomonsRing = {
    name:"King Solomon's Ring",
    query: Promise.resolve(),
    current_display: "",
    vocab: "https://vocab.audioblast.org",
    //At most this many vocabulary terms are shown, and this many words and pairs of words looked up for each match
    maxTerms: 5,
    maxLookups: 20,
    searches: new Map(),
    terms: [],
    displayPrototype() {
      return {info: "susie", content: "solomon"};
    },

    escapeHTML(text) {
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    },

    //Look up each word, and each pair of words, of a match in the vocabulary, and show the terms whose names (or the
    //names of their synonyms) are in it. Longer names are matched first, so "peak frequency" shows that term but not
    //"frequency" as well. A match that is a term's short name also shows the term, and is tagged as a trait value for the
    //traits box. Names aren't tagged, so a name that isn't a trait value doesn't hide the traits of taxa in the query.
    findTerms(match, core) {
      const words = String(match).replace(/:(?:'[^']*':)+/g, " ").split(/[^\p{L}\p{N}]+/u).filter(word => word != "");
      const phrases = new Set();
      words.forEach((word, i) => {
        if (word.length > 2) {
          phrases.add(word.toLowerCase());
        }
        if (i + 1 < words.length) {
          phrases.add((word+" "+words[i + 1]).toLowerCase());
        }
      });
      Promise.all(Array.from(phrases).slice(0, this.maxLookups).map(phrase => this.search(phrase)))
      .then(results => {
        const query = words.join(" ").toLowerCase();
        let text = " "+query+" ";
        results.flat()
        .filter(suggestion => typeof suggestion.name == "string" && typeof suggestion.uri == "string" && suggestion.uri.startsWith(this.vocab+"/"))
        .map(suggestion => ({suggestion: suggestion, name: this.words(suggestion.name), shortname: this.words(suggestion.shortname)}))
        .filter(candidate => candidate.name != "")
        .sort((a, b) => b.name.length - a.name.length)
        .forEach(candidate => {
          if (text.includes(" "+candidate.name+" ")) {
            text = text.split(" "+candidate.name+" ").join(" | ");
          } else if (candidate.shortname != query) {
            return;
          }
          this.addTerm(candidate.suggestion);
          if (candidate.shortname == query) {
            core.replaceMatch(match, ":'trait_value':'"+match+"':", this.name);
          }
        });
      });
    },

    //The vocabulary's suggestions for a word or pair of words, each looked up only once
    search(phrase) {
      if (!this.searches.has(phrase)) {
        this.searches.set(phrase, fetch(this.vocab+"/api/search/?q="+encodeURIComponent(phrase))
        .then(res => res.json())
        .then(data => Array.isArray(data) ? data : [])
        .catch(error => []));
      }
      return this.searches.get(phrase);
    },

    //A name as lower case words separated by single spaces, as matches are compared
    words(name) {
      return String(name || "").toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(word => word != "").join(" ");
    },

    addTerm(suggestion) {
      if (this.terms.length >= this.maxTerms || this.terms.some(term => term.uri == suggestion.uri)) {
        return;
      }
      const term = {
        uri: suggestion.uri,
        name: (suggestion.synonym_of != null) ? suggestion.synonym_of : suggestion.name,
        synonym: (suggestion.synonym_of != null) ? suggestion.name : null,
        definition: null
      };
      this.terms.push(term);
      //The term's address gives its definition as plain text to clients that ask for JSON-LD
      fetch(term.uri, {headers: {Accept: "application/ld+json"}})
      .then(res => res.json())
      .then(data => {
        const nodes = Array.isArray(data["@graph"]) ? data["@graph"] : [data];
        const node = nodes.find(node => node["@id"] == term.uri);
        term.definition = (node != null) ? this.literal(node["skos:definition"]) : null;
      })
      .catch(function (error) {
      })
      .finally(() => {
        this.showTerms();
      });
    },

    //The text of a JSON-LD literal, preferring English if there are several
    literal(value) {
      if (Array.isArray(value)) {
        const english = value.find(item => item != null && item["@language"] == "en");
        return this.literal((english != null) ? english : value[0]);
      }
      if (typeof value == "string") {
        return value;
      }
      return (value != null && typeof value["@value"] == "string") ? value["@value"] : null;
    },

    //The vocabulary box is built from elements rather than HTML, so text from the vocabulary is never read as markup
    showTerms() {
      const content = [];
      this.terms.forEach(term => {
        content.push(this.element("h2", term.name));
        if (term.synonym != null) {
          content.push(this.element("p", "“"+term.synonym+"” is a synonym of "+term.name+"."));
        }
        if (term.definition != null) {
          content.push(this.element("p", term.definition));
        }
        const link = this.element("a", term.uri);
        link.href = term.uri;
        const linkParagraph = document.createElement("p");
        linkParagraph.appendChild(link);
        content.push(linkParagraph);
      });
      const box = document.getElementById("susie");
      box.replaceChildren(...content);
      box.style.display = "block";
    },

    element(tagName, text) {
      const element = document.createElement(tagName);
      element.textContent = text;
      return element;
    },

    parse(mode, match, core) {
      if (match == "silent") {
        core.replaceMatch("silent", ":'named_trait_with_value':'Silent taxa':'Sound Production Method':'None':", this.name);
        return;
      }

      //TODO: Below use text_traits API
      this.query.then(d => {
        fetch(AB_API_BASE+"/data/traits/?value="+encodeURIComponent(match)+"&page_size=1&output=nakedJSON")
        .then(res => res.json())
        .then(data => {
          if (data.length == 1) {
            core.replaceMatch(match, ":'trait_value':'"+match+"':", this.name);
          }
        })
      });

      this.query.then(d => {
        this.findTerms(match, core);
      });

      this.query.then(d => {
        fetch(AB_API_BASE+"/data/traits/?trait="+encodeURIComponent(match)+"&page_size=1&output=nakedJSON")
        .then(res => res.json())
        .then(data => {
          if (data.length == 1) {
            core.replaceMatch(match, ":'trait':'"+match+"':", this.name);
          }
        })
      });
      },

    display(mode, matched, core) {      
      var filters = Array();
      var title = "";
      matched.forEach(element => {
        const parts = element.split(":");
        if (parts[1] == "'named_trait_with_value'") {
          title += this.escapeHTML(parts[2].replaceAll("'", ""))+" ";
          filters.push({
            field: "trait",
            type: "=",
            value: parts[3].replaceAll("'", "")
          });
          filters.push({
            field: "value",
            type: "=",
            value: parts[4].replaceAll("'", "")
          });

        } else if (parts[1] == "'trait_value'") {
          title += this.escapeHTML(parts[2].replaceAll("'", ""))+" ";
          filters.push({
            field: "value",
            type: "=",
            value: parts[2].replaceAll("'", "")
          });
        } else if (parts[1] == "'trait'") {
            title += this.escapeHTML(parts[2].replaceAll("'", ""))+" ";
            filters.push({
              field: "trait",
              type: "=",
              value: parts[2].replaceAll("'", "")
            });
          } else if (parts[1] == "'taxon_with_rank'") {
            const italicise = ['genus', 'species'];
            if (italicise.includes(parts[3].replaceAll("'", ""))) {
              title += "<i>"+this.escapeHTML(parts[2].replaceAll("'", ""))+"</i> ";
            } else {
              title += this.escapeHTML(parts[2].replaceAll("'", ""))+" ";
            }
            filters.push({
              field: parts[3].replaceAll("'", ""),
              type: "=",
              value: parts[2].replaceAll("'", "")
            });
          }
        });
      if (title + JSON.stringify(filters) == this.current_display) {
        return;
      } else {
        this.traitsDisplay(title, filters);
        this.current_display = title + JSON.stringify(filters);
      }
    },

    traitsDisplay(title, filters) {
      if (filters.length === 0) { return; }
      let params = filters.map(element => `${encodeURIComponent(element.field)}=${encodeURIComponent(element.value)}`).join('&');
      params = `?${params}`;

      this.query = fetch(AB_API_BASE+"/data/traitstaxa/"+params+"&page_size=1&output=nakedJSON")
      .then(res => res.json())
      .then(data => {
        if (data.length == 1) {
          document.getElementById("solomon").innerHTML = '<h2>Traits for '+title+'</h2><div id="traits-tabulator" class="search-table"></div>';
          generateTabulator("#traits-tabulator", "traitstaxa", filters.slice());
        } else {
          document.getElementById("solomon").style.display = "none";
        }
      })
    },

    searchSuggest(){
      return([
        "mandibular grinding",
        "tremulation",
        "silent"
      ]);
    }
  }
  
