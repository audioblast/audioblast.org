const traitBot = {
    name:"TraitBot",
    urlParams: ["trait"],
    mode: "trait",
    canParse(string, core) {
      if (string.toLowerCase() == "silent") {
        core.matched["trait"] = {trait:"Sound Production Method", value:"None"};
        core.parsed(this.name, "trait", "Silent taxa");
        return;
      }
  
      var dataRequested = fetch("https://api.audioblast.org/data/traits/?trait="+string+"&output=nakedJSON")
        .then(res => res.json())
        .then(data => {
          if (data.length > 0) {
            core.parsed(this.name, "trait", "Silent taxa");
            return;
          }
          core.parsed(this.name, false);
        })
        .catch(function (error) {
        });
    },
    display(mode, matched) {
      if ("taxon"in matched) {
        var ret = '<div class="feature">';
        ret += "<h2>Traits "+matched["taxon"]+"</h2>";
        ret += '<div id="traits-tabulator" class="search-table"></div>';
        const script = 'generateTabulator("#traits-tabulator", "traitstaxa", {field:"'+matched["rank"]+'", type:"=", value:"'+matched["taxon"]+'"});';
  
        return({html:ret, js:script});
      }
      if ("trait" in matched) {
        var ret = '<div class="feature">';
        var script = '';
        ret += "<h2>"+matched["trait"]+"</h2>";
        ret += '<div id="traits-tabulator" class="search-table"></div>';
        if (matched["trait"] == "Silent taxa") {
          script = 'generateTabulator("#traits-tabulator", "traits", ['+
                            '{field:"trait", type:"=", value:"Sound Production Method"},'+
                            '{field:"value", type:"=", value:"None"}'+
                          ']);';
        } else {
          script = 'generateTabulator("#traits-tabulator", "traits", {field:"trait", type:"=", value:"'+matched["trait"]+'"});';
        }
        return({html:ret, js:script});
      }
      return(false);
    },
    searchSuggest() {
    return([
      "silent"
    ]);
    }
  }