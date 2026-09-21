/*
Pollux search plugin for searchAB

The Pollux plugin looks for terms from the Bioacoustics & Ecoacoustics Glossary
(https://glossary.acousti.cloud) in the query and shows their definitions in the glossary box.
A synonym of a term leads to that term. Pollux accounts for nothing in the query, so the other
plugins see it exactly as it was.

The plugin is named after Julius Pollux, whose Onomasticon gathered the words used for each
subject, as the glossary's Ontomasticon software does.
*/
const pollux = {
  name: "Pollux",
  glossary: "https://glossary.acousti.cloud",
  //At most this many terms are shown, and this many words and pairs of words looked up
  maxTerms: 5,
  maxLookups: 20,
  searches: new Map(),
  definitions: new Map(),

  boxes() {
    return({info: "pollux"});
  },

  async recognise(search) {
    const terms = await vocabularyTerms(search, this, this.glossary, search.query);
    return(terms.map(term => Object.assign({type: "glossaryTerm"}, term)));
  },

  render(search, boxes) {
    const box = boxes.info;
    const terms = search.of("glossaryTerm").slice(0, this.maxTerms);
    if (box == null || terms.length == 0) {
      return;
    }
    //Built from elements rather than markup, so text from the glossary is never read as markup
    const heading = document.createElement("h2");
    const link = document.createElement("a");
    link.href = this.glossary+"/";
    link.textContent = "Bioacoustics & Ecoacoustics Glossary";
    heading.appendChild(link);
    box.appendChild(heading);
    terms.forEach(term => {
      const title = document.createElement("h3");
      const termLink = document.createElement("a");
      termLink.href = term.uri;
      termLink.textContent = term.name;
      title.appendChild(termLink);
      box.appendChild(title);
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
    });
  }
}
