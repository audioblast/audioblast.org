/*
King Solomon's Ring (KSR) plugin for searchAB

KSR reads the query for traits: the values the data is written with, the traits those values
belong to, and the terms of the audioBlast vocabulary the query names. It shows the vocabulary
terms in one box and, in another, the traits of whatever the query asked about.

KSR is named after the book by Konrad Lorenz, King Solomon's Ring, in which he describes his
experiments with jackdaws and their vocalisations. He describes how he was able to identify
individual jackdaws by their vocalisations and how he was able to identify the meaning of the
vocalisations.
*/
const kingSolomonsRing = {
  name: "King Solomon's Ring",
  vocab: "https://vocab.audioblast.org",
  //At most this many vocabulary terms are shown, and this many words and pairs of words looked up
  maxTerms: 5,
  maxLookups: 20,
  searches: new Map(),
  definitions: new Map(),
  //Every trait value the data is written with, fetched once and held under the one key
  values: new Map(),
  probed: new Map(),

  boxes() {
    return({info: "susie", content: "solomon"});
  },

  async recognise(search) {
    const found = [];
    //Traits are read from what nothing else has accounted for
    const text = search.remaining();
    if (text.toLowerCase() == "silent") {
      //Asking which taxa are silent asks for a trait with a value, not for a value on its own
      found.push({type: "namedTraitValue", label: "Silent taxa", trait: "Sound Production Method", value: "None", text: text});
    } else if (text != "") {
      const answer = await searchCache(search, this.values, "all", () =>
        searchFetch(search, AB_API_BASE+"/data/traits/list_text_values/"));
      const values = (answer != null && Array.isArray(answer.data)) ? answer.data : [];
      const spoken = text.toLowerCase();
      const value = values.find(held => typeof held == "string" && held.toLowerCase() == spoken);
      if (value != null) {
        found.push({type: "traitValue", value: value, text: text});
      }
      //A trait by its name, which the list of values does not hold
      const traits = await searchCache(search, this.probed, spoken, () =>
        searchFetch(search, AB_API_BASE+"/data/traits/?trait="+encodeURIComponent(text)+"&page_size=1&output=nakedJSON"));
      if (Array.isArray(traits) && traits.length == 1 && typeof traits[0]["trait"] == "string") {
        found.push({type: "trait", trait: traits[0]["trait"], text: text});
      }
    }
    //The vocabulary is read from the whole query instead, as a term says what the query is about
    //even where another plugin has already accounted for those same words
    const terms = await vocabularyTerms(search, this, this.vocab, search.query);
    terms.forEach(term => found.push(Object.assign({type: "vocabTerm"}, term)));
    return(found);
  },

  async render(search, boxes) {
    this.showTerms(search, boxes.info);
    await this.showTraits(search, boxes.content);
  },

  //Built from elements rather than markup, so text from the vocabulary is never read as markup
  showTerms(search, box) {
    const terms = search.of("vocabTerm").slice(0, this.maxTerms);
    if (box == null || terms.length == 0) {
      return;
    }
    terms.forEach(term => {
      const heading = document.createElement("h2");
      heading.textContent = term.name;
      box.appendChild(heading);
      if (term.synonym != null) {
        const synonym = document.createElement("p");
        synonym.textContent = "“"+term.synonym+"” is a synonym of "+term.name+".";
        box.appendChild(synonym);
      }
      if (term.definition != null) {
        const definition = document.createElement("p");
        definition.textContent = term.definition;
        box.appendChild(definition);
      }
      const paragraph = document.createElement("p");
      const link = document.createElement("a");
      link.href = term.uri;
      link.textContent = term.uri;
      paragraph.appendChild(link);
      box.appendChild(paragraph);
    });
  },

  async showTraits(search, box) {
    if (box == null) {
      return;
    }
    const filters = [];
    const title = [];
    search.of("namedTraitValue").forEach(annotation => {
      title.push({text: annotation.label});
      filters.push({field: "trait", type: "=", value: annotation.trait});
      filters.push({field: "value", type: "=", value: annotation.value});
    });
    search.of("traitValue").forEach(annotation => {
      title.push({text: annotation.value});
      filters.push({field: "value", type: "=", value: annotation.value});
    });
    search.of("trait").forEach(annotation => {
      title.push({text: annotation.trait});
      filters.push({field: "trait", type: "=", value: annotation.trait});
    });
    const taxon = mostSpecificTaxon(search);
    if (taxon != null) {
      const name = taxon.classification["taxon"];
      title.push({text: name, italic: ["genus", "species"].includes(taxon.rank)});
      filters.push({field: taxon.rank, type: "=", value: name});
    }
    if (filters.length == 0) {
      return;
    }
    const params = filters
      .map(filter => encodeURIComponent(filter.field)+"="+encodeURIComponent(filter.value))
      .join("&");
    const any = await searchFetch(search, AB_API_BASE+"/data/traitstaxa/?"+params+"&page_size=1&output=nakedJSON");
    if (!Array.isArray(any) || any.length == 0) {
      return;
    }
    const heading = document.createElement("h2");
    heading.appendChild(document.createTextNode("Traits for "));
    title.forEach((part, i) => {
      if (i > 0) {
        heading.appendChild(document.createTextNode(" "));
      }
      if (part.italic) {
        const italic = document.createElement("i");
        italic.textContent = part.text;
        heading.appendChild(italic);
      } else {
        heading.appendChild(document.createTextNode(part.text));
      }
    });
    const table = document.createElement("div");
    table.id = "traits-tabulator";
    table.className = "search-table";
    box.append(heading, table);
    generateTabulator("#traits-tabulator", "traitstaxa", filters.slice());
  },

  searchSuggest() {
    return([
      "mandibular grinding",
      "tremulation",
      "silent"
    ]);
  }
}
