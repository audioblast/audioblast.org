/*
Rosetta search plugin for searchAB

The Rosetta plugin for searchAB is a plugin that processes the user's search query for emoji
and attempts to match the emoji to a taxon using Phymoji.

The plugin is named after the Rosetta Stone, which was used to decipher Egyptian hieroglyphics.
*/
const rosetta = {
  name:"Rosetta",
  query: Promise.resolve(),
  parse(mode, match, core) {
    const parts = match.split(" ");
    parts.forEach(match => {
      this.query = fetch("https://api.audioblast.org/standalone/phymoji/get_taxon/?emoji="+match+"&output=nakedJSON")
        .then(res => res.json())
        .then(data => {
          if (data.length > 0) {
            core.replaceMatch(match, data, this.name);
          }
        })
        .catch(function (error) {
        }); 
    });
  },
  display() {},
  searchSuggest() {
    return([
      "🦗",
      "🐜"
    ]);
  }
}
