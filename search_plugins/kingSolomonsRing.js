const kingSolomonsRing = {
    name:"King Solomon's Ring",
    query: Promise.resolve(),
    displayPrototype() {
      const ret = {content:"solomon"};
      return(ret);
    },

    parse(mode, match, core) {
      if (match == "silent") {
        core.addMatch(":named_trait_with_value:Silent taxa:Sound Production Method:None", this.name);
      }
    },

    display(mode, matched, core) {
      this.query.then(this.doDisplay(mode, matched));
    },
    doDisplay(mode, matched) {
      if (matched.startsWith(":named_trait_with_value:")) {
        document.getElementById("solomon").style.display = "block";
        parts = matched.split(":");
        named_trait = parts[2];
        trait = parts[3];
        trait_value = parts[4];
        this.query = dataRequested = fetch("https://api.audioblast.org/data/traits/?trait="+trait+"&value="+trait_value+"&page_size=1&output=nakedJSON")
        .then(res => res.json())
        .then(data => {
          if (data.length == 1) {
            document.getElementById("solomon").innerHTML = '<h2>'+named_trait+'</h2><div id="traits-tabulator" class="search-table"></div>';
            eval('generateTabulator("#traits-tabulator", "traits", [{field:"trait", type:"=", value:"'+trait+'"},{field:"value", type:"=", value:"'+trait_value+'"}]);');
          } else {
            document.getElementById("solomon").style.display = "none";
          }
        })
      } else if (matched.startsWith(":taxon_with_rank:")) {
        document.getElementById("solomon").style.display = "block";
        parts = matched.split(":");
        taxon = parts[2];
        rank  = parts[3].toLowerCase();
        this.query = fetch("https://api.audioblast.org/data/traitstaxa/?"+rank+"="+taxon+"&page_size=1&output=nakedJSON")
        .then(res => res.json())
        .then(data => {
          if (data.length == 1) {
            document.getElementById("solomon").innerHTML = '<h2>Traits</h2><div id="traitstaxa-tabulator" class="search-table"></div>';
            eval('generateTabulator("#traitstaxa-tabulator", "traitstaxa", {field:"'+rank+'", type:"=", value:"'+taxon+'"});');
          } else {
            document.getElementById("solomon").style.display = "none";
          }
        })
        .catch(function (error) {
        }); 
      } else {
      //Match trait value
      document.getElementById("solomon").style.display = "block";
        this.query = fetch("https://api.audioblast.org/data/traits/?value="+matched+"&page_size=1&output=nakedJSON")
        .then(res => res.json())
        .then(data => {
          if (data.length == 1) {
            document.getElementById("solomon").innerHTML = '<h2>Traits</h2><div id="traits-tabulator" class="search-table"></div>';
            eval('generateTabulator("#traits-tabulator", "traits", {field:"value", type:"=", value:"'+matched+'"});');
          } else {
            //document.getElementById("solomon").style.display = "none";
          }
        })
        .catch(function (error) {
        }); 
      }
    },

    searchSuggest(){
      return([
        "mandibular grinding",
        "tremulation",
        "silent"
      ]);
    }
  }
  