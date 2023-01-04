const rosetta = {
  name:"Rosetta",
  parse(mode, match, core) {
    const parts = match.split(" ");
    parts.forEach(match => {
      var dataRequested = fetch("https://api.audioblast.org/standalone/phymoji/get_taxon/?emoji="+match+"&output=nakedJSON")
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
  searchSuggest() {
    return([
      "🦗",
      "🐜"
    ]);
  }
}
