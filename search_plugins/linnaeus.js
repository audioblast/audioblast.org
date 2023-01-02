// Provides a taxon information box where relevant
const linnaeus = {
  name: "Linnaeus",
  query: Promise.resolve(),
  displayPrototype() {
    const ret = {info:"linnaeus"};
    return(ret);
  },

  display(mode, matched, core) {
    if (matched.startsWith(":")) {return;}
    var dataRequested = fetch("https://api.audioblast.org/data/taxa/?taxon="+matched+"&output=nakedJSON")
      .then(res => res.json())
      .then(data => {
        if (data.length == 1) {
          taxon_info = data[0];
          core.addMatch(":taxon_with_rank:"+taxon_info["taxon"]+":"+taxon_info["rank"], this.name);
          var ret = '<h2>'+taxon_info["rank"]+": "+taxon_info["taxon"]+'</h2>';
          const ranks = [
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
          const italicise = ["genus", "species"];
          var first = true;
          ranks.forEach(element => {
            if (taxon_info[element] != null) {
              if (!first) {
                ret += " > ";
              }
              var name = italicise.includes(element) ? "<i>"+taxon_info[element]+"</i>" : taxon_info[element];
              ret += '<a href="audioblast.php?search=:taxon_with_rank:'+taxon_info[element]+':'+element+'">'+name+"</a>";
              first = false;
            }
          });
          document.getElementById("linnaeus").style.display = "block";
          document.getElementById("linnaeus").innerHTML = ret+'<br>&nbsp;';
        } else {
          document.getElementById("linnaeus").style.display = "none";
        }
      })
      .catch(function (error) {
    });
  },

  searchSuggest(){
    return([
      "Gryllotalpa vineae"
    ]);
  }
}
