const kingSolomonsRing = {
    name:"King Solomon's Ring",
    displayPrototype() {
      const ret = {content:"solomon"};
      return(ret);
    },

    parse(mode, match, core) {
      if (match == "silent") {
        core.addMatch(":named_trait_with_value:Silent taxa:Sound Production Method:None", this.name);
      }
    },

    display(mode, matched) {
      if (matched.startsWith(":named_trait_with_value:")) {
        parts = matched.split(":");
        named_trait = parts[2];
        trait = parts[3];
        trait_value = parts[4];
        var dataRequested = fetch("https://api.audioblast.org/data/traits/?trait="+trait+"&value="+trait_value+"&page_size=1&output=nakedJSON")
        .then(res => res.json())
        .then(data => {
          if (data.length == 1) {
            document.getElementById("solomon").innerHTML = '<h2>'+named_trait+'</h2><div id="traits-tabulator" class="search-table"></div>';
            eval('generateTabulator("#traits-tabulator", "traits", [{field:"trait", type:"=", value:"'+trait+'"},{field:"value", type:"=", value:"'+trait_value+'"}]);');
          }
        })
      }
      if (matched.startsWith(":taxon_with_rank:")) {
        parts = matched.split(":");
        taxon = parts[2];
        rank  = parts[3].toLowerCase();
        var dataRequested = fetch("https://api.audioblast.org/data/traitstaxa/?"+rank+"="+taxon+"&page_size=1&output=nakedJSON")
        .then(res => res.json())
        .then(data => {
          if (data.length == 1) {
            document.getElementById("solomon").innerHTML = '<h2>Traits</h2><div id="traitstaxa-tabulator" class="search-table"></div>';
            eval('generateTabulator("#traitstaxa-tabulator", "traitstaxa", {field:"'+rank+'", type:"=", value:"'+taxon+'"});');
          }
        })
        .catch(function (error) {
        }); 
      }

      //Match trait value
      var dataRequested = fetch("https://api.audioblast.org/data/traits/?value="+matched+"&page_size=1&output=nakedJSON")
      .then(res => res.json())
      .then(data => {
        if (data.length == 1) {
          document.getElementById("solomon").innerHTML = '<h2>Traits</h2><div id="traits-tabulator" class="search-table"></div>';
          eval('generateTabulator("#traits-tabulator", "traits", {field:"value", type:"=", value:"'+matched+'"});');
        }
      })
      .catch(function (error) {
      }); 
    },

    searchSuggest(){
      return([
        "mandibular grinding",
        "tremulation",
        "silent"
      ]);
    }
  }
  