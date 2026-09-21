/*
Pythia plugin for searchAB

Pythia asks the audioBlast API which parts of the query are taxonomic names. Everything that works
from a taxon — the taxon box, the recordings, the traits, the annotations — starts here, so Pythia
used to sit in the core. It is a plugin like any other now: the core runs the recognisers until
they settle, so nothing depends on Pythia having gone first.

Named after the Oracle of Apollo at Delphi.
*/
const pythia = {
  name: "Pythia",
  //Each piece of text is asked about once, as the core runs the recognisers more than once
  asked: new Map(),

  async recognise(search) {
    const text = search.remaining();
    if (text == "") {
      return([]);
    }
    if (!this.asked.has(text)) {
      this.asked.set(text, await searchFetch(search, AB_API_BASE+"/standalone/pythia/process/?query="+encodeURIComponent(text)));
    }
    const answer = this.asked.get(text);
    const taxa = (answer != null && answer.data != null && Array.isArray(answer.data.taxa)) ? answer.data.taxa : [];
    return(taxa
      .filter(taxon => typeof taxon.match == "string" && taxon.match.trim() != "")
      .map(taxon => ({type: "taxon", value: taxon.match, text: taxon.match})));
  }
}
