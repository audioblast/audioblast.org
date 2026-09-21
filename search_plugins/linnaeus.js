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
  //The ranks a classification is given at, from the highest to the lowest. A taxon is only taken
  //at one of these, as its rank names the field the other plugins filter recordings and traits by,
  //and a field the API doesn't know is ignored rather than refused: a search for a taxon at a rank
  //such as Complex would quietly show every recording as if it were that taxon's.
  ranks: [
    "kingdom",
    "class",
    "order",
    "suborder",
    "family",
    "subfamily",
    "tribe",
    "genus",
    "species"
  ],
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

  //A taxon is held by every source that knows it, and a source may hold it at more than one rank:
  //iNaturalist gives Gryllotalpa gryllotalpa both as a species and as a species complex. The most
  //completely classified of the rows at a rank we know is taken, and the first where several tie.
  bestMatch(data) {
    if (!Array.isArray(data)) {
      return(null);
    }
    const known = data.filter(row => row != null && typeof row["rank"] == "string" && this.ranks.includes(row["rank"].toLowerCase()));
    if (known.length == 0) {
      return(null);
    }
    return(known.reduce((best, row) => (this.classified(row) > this.classified(best)) ? row : best));
  },

  //How many of the ranks a row names the taxon's classification at
  classified(row) {
    return(this.ranks.filter(rank => row[rank] != null && row[rank] != "").length);
  },

  taxonDisplay(mode, taxa, core) {
    taxa.forEach(matched => {
      const passed_match = matched;
      var parts = matched.split(":");
      matched = parts[2].replaceAll("'", "");
      this.query = fetch(AB_API_BASE+"/data/taxa/?taxon="+encodeURIComponent(matched)+"&output=nakedJSON")
        .then(res => res.json())
        .then(data => {
          const taxon_info = this.bestMatch(data);
          if (taxon_info != null) {
            core.replaceMatch(passed_match, ":'taxon_with_rank':'"+taxon_info["taxon"]+"':'"+taxon_info["rank"].toLowerCase()+"':", this.name);
            const box = document.getElementById("linnaeus");
            const heading = document.createElement("h2");
            heading.textContent = taxon_info["rank"]+": "+taxon_info["taxon"];
            const italicise = ["genus", "species"];
            const content = [heading];
            this.ranks.forEach(element => {
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
