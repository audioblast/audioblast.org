/*
Pollux search plugin for searchAB

The Pollux plugin for searchAB looks for terms from the Bioacoustics & Ecoacoustics Glossary
(https://glossary.acousti.cloud) in the user's search query, and shows their definitions in the
glossary box. A synonym of a term leads to that term. Pollux doesn't replace any part of the query,
so the other plugins see it as before.

The plugin is named after Julius Pollux, whose Onomasticon gathered the words used for each subject,
as the glossary's Ontomasticon software does.
*/

const pollux = {
  name: "Pollux",
  query: Promise.resolve(),
  glossary: "https://glossary.acousti.cloud",
  //At most this many terms are shown, and this many words and pairs of words looked up for each part of the query
  maxTerms: 5,
  maxLookups: 20,
  searched: new Set(),
  lookups: 0,
  suggestions: new Map(),
  queryParts: new Map(),
  terms: [],

  displayPrototype() {
    return({info: "pollux"});
  },

  //Look up each word, and each pair of words, in the parts of the query that other plugins haven't tagged
  parse(mode, match, core) {
    const words = match.replace(/:(?:'[^']*':)+/g, " ").split(/[^\p{L}\p{N}]+/u).filter(word => word != "");
    if (words.length > 0) {
      this.queryParts.set(words.join(" "), words);
    }
    const phrases = new Set();
    words.forEach((word, i) => {
      if (word.length > 2) {
        phrases.add(word.toLowerCase());
      }
      if (i + 1 < words.length) {
        phrases.add((word + " " + words[i + 1]).toLowerCase());
      }
    });
    Array.from(phrases).filter(phrase => !this.searched.has(phrase)).slice(0, this.maxLookups).forEach(phrase => {
      this.search(phrase);
    });
    this.finish();
  },

  search(phrase) {
    this.searched.add(phrase);
    this.lookups++;
    fetch(this.glossary + "/api/search/?q=" + encodeURIComponent(phrase))
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          data.forEach(suggestion => this.suggestions.set(suggestion.uri + " " + suggestion.name, suggestion));
        }
      })
      .catch(function (error) {
      })
      .finally(() => {
        this.lookups--;
        this.finish();
      });
  },

  //Once every lookup has answered, show the terms whose names (or the names of their synonyms) are in the query.
  //Longer names are matched first, so a query for "calling song" shows that term but not "song" as well.
  finish() {
    if (this.lookups > 0) {
      return;
    }
    const suggestions = Array.from(this.suggestions.values())
      .filter(suggestion => typeof suggestion.name == "string" && typeof suggestion.uri == "string" && suggestion.uri.startsWith(this.glossary + "/"))
      .map(suggestion => ({suggestion: suggestion, name: this.words(suggestion.name)}))
      .filter(candidate => candidate.name != "")
      .sort((a, b) => b.name.length - a.name.length);
    this.queryParts.forEach(words => {
      let text = " " + words.join(" ").toLowerCase() + " ";
      suggestions.forEach(candidate => {
        if (text.includes(" " + candidate.name + " ")) {
          text = text.split(" " + candidate.name + " ").join(" | ");
          this.addTerm(candidate.suggestion);
        } else if (candidate.suggestion.acronym && words.includes(candidate.suggestion.acronym)) {
          this.addTerm(candidate.suggestion);
        }
      });
    });
    this.render();
  },

  //A name as lower case words separated by single spaces, as the query is compared
  words(name) {
    return(name.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(word => word != "").join(" "));
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
        this.render();
      })
      .catch(function (error) {
      });
  },

  //The text of a JSON-LD literal, preferring English if there are several
  literal(value) {
    if (Array.isArray(value)) {
      const english = value.find(item => item != null && item["@language"] == "en");
      return(this.literal((english != null) ? english : value[0]));
    }
    if (typeof value == "string") {
      return(value);
    }
    return((value != null && typeof value["@value"] == "string") ? value["@value"] : null);
  },

  //The glossary box is built from elements rather than HTML, so text from the glossary is never read as markup
  render() {
    const box = document.getElementById("pollux");
    if (!box) {
      return;
    }
    if (this.terms.length == 0) {
      box.style.display = "none";
      return;
    }
    box.style.display = "block";
    box.textContent = "";
    const heading = document.createElement("h2");
    heading.appendChild(this.link(this.glossary + "/", "Bioacoustics & Ecoacoustics Glossary"));
    box.appendChild(heading);
    this.terms.forEach(term => {
      const title = document.createElement("h3");
      title.appendChild(this.link(term.uri, term.name));
      box.appendChild(title);
      if (term.synonym != null) {
        box.appendChild(this.paragraph("“" + term.synonym + "” is a synonym of " + term.name + "."));
      }
      if (term.definition != null) {
        box.appendChild(this.paragraph(term.definition));
      }
    });
  },

  link(href, text) {
    const a = document.createElement("a");
    a.href = href;
    a.textContent = text;
    return(a);
  },

  paragraph(text) {
    const p = document.createElement("p");
    p.textContent = text;
    return(p);
  }
}
