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
      var hasTrait = false;
      matched.forEach(element => {
        if (
          element.startsWith(":'named_trait_with_value':'Silent taxa':") ||
          element.startsWith(":'trait':") ||
          element.startsWith(":'trait_value':")
        ) {
          hasTrait = true;
        }
        if (element.startsWith(":'taxon_with_rank':")) {
          annotations.push(element);
        }
      });
      // Annotations aren't shown for searches with a trait
      if (annotations.length > 0 && !hasTrait) {
        this.annotationsDisplay(annotations);
      } else {
        document.getElementById("fermat").innerHTML = "";
        document.getElementById("fermat").style.display = "none";
        this.current_display = "";
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
        const parts = matched.split(":");
        const taxon = parts[2].replaceAll("'", "");
        var dataRequested = fetch(AB_API_BASE+"/data/annomate/?taxon="+encodeURIComponent(taxon)+"&page_size=1&output=nakedJSON")
        .then(res => res.json())
        .then(data => {
          // Ignore the response if the box has since been emptied or moved on to another taxon
          if (this.current_display != matched) {
            return;
          }
          if (data.length == 1) {
            document.getElementById("fermat").innerHTML = '<h2>Annotations</h2><div id="annotations-tabulator" class="search-table"></div>';
            generateTabulator("#annotations-tabulator", "annomate", {field:"taxon", type:"=", value:taxon});
          } else {
            document.getElementById("fermat").style.display = "none";
          }
        })
        .catch(function (error) {
        });
      });
    }
  }
    