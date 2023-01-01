const taxonSearch = {
    name: "Linnaeus",
    data: null,
    canParse(string, core) {
      var dataRequested = fetch("https://api.audioblast.org/data/taxa/?taxon="+string+"&output=nakedJSON")
        .then(res => res.json())
        .then(data => {
          if (data.length == 1) {
            this.data = data[0];
            core.matched["rank"] = this.data["rank"].toLowerCase();
            core.parsed(this.name, "taxon", string);
            return;
          }
          core.parsed(this.name, false);
        })
        .catch(function (error) {
      });
      this.data = dataRequested;
      return;
    },
    urlParams: ["taxon"],
    mode: "taxon",
    display(mode, matched) {
      if ("taxon" in matched) {
        var ret = '<div id="search-result-taxon" class="feature">';
        Promise.resolve(this.data).then(ret += this.displayTaxon(matched)
        );
        ret += "</div";
        return({html:ret});
      }
      return(false);
    },
    displayTaxon(matched) {
      if (this.data != null) {
        var ret = '<h2>'+this.data["rank"]+": "+this.data["taxon"]+'</h2>';
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
        var first = true;
        ranks.forEach(element => {
          if (this.data[element] != null) {
            if (!first) {
              ret += " > ";
            }
            ret += '<a href="audioblast.php?taxon='+this.data[element]+'">'+this.data[element]+"</a>";
            first = false;
          }
        });
      }
      return(ret);
    },
    searchSuggest(){
      return([
        "Gryllotalpa vineae"
      ]);
    }
  }
  