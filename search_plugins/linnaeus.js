/*
Linnaeus plugin for searchAB.

The Linnaeus plugin for searchAB is a plugin that identifies any taxa in  the user's search query
(i.e. the :taxon: tag is applied) and provides information about the taxon in the taxon box. Typically
the tagged strings are generated from Pythia previously processing the user's query.

The plugin is named after Carl Linnaeus, the father of modern taxonomy.
*/

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
      this.query = fetch(AB_API_BASE+"/data/taxa/?taxon="+encodeURIComponent(matched)+"&output=nakedJSON")
        .then(res => res.json())
        .then(data => {
          if (data.length == 1) {
            const taxon_info = data[0];
            core.replaceMatch(passed_match, ":'taxon_with_rank':'"+taxon_info["taxon"]+"':'"+taxon_info["rank"].toLowerCase()+"':", this.name);
            const box = document.getElementById("linnaeus");
            const heading = document.createElement("h2");
            heading.textContent = taxon_info["rank"]+": "+taxon_info["taxon"];
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
            const content = [heading];
            ranks.forEach(element => {
              if (taxon_info[element] != null) {
                if (content.length > 1) {
                  content.push(" > ");
                }
                const link = document.createElement("a");
                link.href = "audioblast.php?search="+encodeURIComponent(taxon_info[element]);
                if (italicise.includes(element)) {
                  const italic = document.createElement("i");
                  italic.textContent = taxon_info[element];
                  link.appendChild(italic);
                } else {
                  link.textContent = taxon_info[element];
                }
                content.push(link);
              }
            });
            content.push(document.createElement("br"), String.fromCharCode(160));
            box.replaceChildren(...content);
            box.style.display = "block";
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
