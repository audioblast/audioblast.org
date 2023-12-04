/*
Fermat search plugin for searchAB

The Fermat plugin for searchAB is a plugin that processes the user's search query for annotations matching
the query. The annotations box is displayed if matches are found.

The plugin is named after Fermat who made a significant annotation.
*/
const fermat = {
    name:"Fermat",
    query: Promise.resolve(),
    current_display: "",
    displayPrototype() {
      const ret = {content:"fermat"};
      return(ret);
    },
  
    parse() {},
  
    display(mode, matched, core) {
      var annotations = Array();
      matched.forEach(element => {
        if (
          element.startsWith(":'named_trait_with_value':'Silent taxa':") ||
          element.startsWith(":'trait':")
        ) {
          document.getElementById("fermat").inerHTML = "";
          document.getElementById("fermat").style.display = "none";
          return;
        }
        if (element.startsWith(":'taxon_with_rank':")) {
          annotations.push(element);
        }
      });
      if (annotations.length > 0 ) {
        this.annotationsDisplay(annotations);
      } else {
        document.getElementById("fermat").inerHTML = "";
        document.getElementById("fermat").style.display = "none";
      }
    },
    annotationsDisplay(annotations) {
      annotations.forEach(matched => {
        if (this.current_display == matched) {
          return;
        } else {
          this.current_display=matched;
        }
        document.getElementById("fermat").style.display = "block";
        parts = matched.split(":");
        taxon = parts[2].replaceAll("'", "");
        rank  = parts[3].replaceAll("'", "").toLowerCase();
        var dataRequested = fetch("https://api.audioblast.org/data/annomate/?taxon="+taxon+"&page_size=1&output=nakedJSON")
        .then(res => res.json())
        .then(data => {
          if (data.length == 1) {
            document.getElementById("fermat").innerHTML = '<h2>Annotations</h2><div id="annotations-tabulator" class="search-table"></div>';
            eval('generateTabulator("#annotations-tabulator", "annomate", {field:"taxon", type:"=", value:"'+taxon+'"});');
          } else {
            document.getElementById("fermat").style.display = "none";
          }
        })
        .catch(function (error) {
        });
      });
    }
  }
    