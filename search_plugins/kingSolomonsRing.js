const kingSolomonsRing = {
    name:"King Solomon's Ring",
    canParse(string, core) {
      var dataRequested = fetch("https://api.audioblast.org/data/traits/list_text_values/?output=nakedJSON")
        .then(res => res.json())
        .then(data => {
          if (data.length > 0) {
            if (data.includes(string.toLowerCase())) {
              core.parsed(this.name, "trait.value", string);
              return;
            }
          }
          core.parsed(this.name, false);
        })
        .catch(function (error) {
      });
    },
    display(mode, matched) {
      if ("trait.value" in matched) {
        var ret = '<div class="feature">';
        var script = '';
        ret += "<h2>"+matched["trait.value"]+"</h2>";
        ret += '<div id="traitsvalue-tabulator" class="search-table"></div>';
        script = 'generateTabulator("#traitsvalue-tabulator", "traits", {field:"value", type:"=", value:"'+matched["trait.value"]+'"});';
        return({html:ret, js:script});
      }
      return false;
    },
    searchSuggest(){
      return([
        "mandibular grinding"
      ]);
    }
  }