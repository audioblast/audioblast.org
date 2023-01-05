// Provides a taxon information box where relevant
const linnaeus = {
  name: "Linnaeus",
  query: Promise.resolve(),
  rendered: false,
  displayPrototype() {
    const ret = {info:"linnaeus"};
    return(ret);
  },

  parse() {},

  display(mode, matched, core) {
    var taxa = Array();
    matched.forEach(element => {
      if (element.startsWith(":'taxon':")) {
        taxa.push(element);
      }
    });
    if (taxa.length == 0) {
      if (!this.rendered) {
        document.getElementById("linnaeus").innerHTML = "";
        document.getElementById("linnaeus").style.display = "none";
      }
    } else {
      this.taxonDisplay(mode, taxa, core);
    }
  },
  taxonDisplay(mode, taxa, core) {
    taxa.forEach(matched => {
      const passed_match = matched;
      var parts = matched.split(":");
      matched = parts[2].replaceAll("'", "");
      this.query = fetch("https://api.audioblast.org/data/taxa/?taxon="+matched+"&output=nakedJSON")
        .then(res => res.json())
        .then(data => {
          if (data.length == 1) {
            taxon_info = data[0];
            core.replaceMatch(passed_match, ":'taxon_with_rank':'"+taxon_info["taxon"]+"':'"+taxon_info["rank"].toLowerCase()+"':", this.name);
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
                ret += '<a href="audioblast.php?search='+taxon_info[element]+'">'+name+"</a>";
                first = false;
              }
            });
            document.getElementById("linnaeus").style.display = "block";
            document.getElementById("linnaeus").innerHTML = ret+'<br>&nbsp;';
            this.rendered = true;
          } else {
            document.getElementById("linnaeus").style.display = "none";
          }
        })
        .catch(function (error) {
      });
    });
  },

  searchSuggest(){
    return([
      "Gryllotalpa vineae"
    ]);
  }
}
