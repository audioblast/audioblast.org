const rosetta = {
  name:"Rosetta",
  parse(mode, match, core) {
    var dataRequested = fetch("https://api.audioblast.org/standalone/phymoji/get_taxon/?emoji="+match+"&output=nakedJSON")
      .then(res => res.json())
      .then(data => {
        if (data.length > 0) {
          core.addMatch(data, this.name);
        }
      })
      .catch(function (error) {
      }); 
  },
  searchSuggest() {
    return([
      "🦗",
      "🐜"
    ]);
  }
}
