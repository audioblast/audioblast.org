/*
King Solomon's Ring (KSR) plugin for searchAB

KSR is a plugin for searchAB that processes the user's search query for traits against 
the audioBlast vocabulary.

It displays the traits box (using the traits-taxa SQL view exposed via the audioBlast
API) if matches are found.

KSR is named after the book by Konrad Lorenz, King Solomon's Ring, in which he
describes his experiments with jackdaws and their vocalisations. He describes
how he was able to identify individual jackdaws by their vocalisations and
how he was able to identify the meaning of the vocalisations.
*/

const kingSolomonsRing = {
    name:"King Solomon's Ring",
    query: Promise.resolve(),
    current_display: "",
    displayPrototype() {
      const ret = {info: "susie", content:"solomon"};
      return(ret);
    },

    parse(mode, match, core) {
      if (match == "silent") {
        core.replaceMatch("silent", ":'named_trait_with_value':'Silent taxa':'Sound Production Method':'None':", this.name);
        return;
      }

      //TODO: Below use text_traits API
      this.query.then(d => {
        fetch("https://api.audioblast.org/data/traits/?value="+match+"&page_size=1&output=nakedJSON")
        .then(res => res.json())
        .then(data => {
          if (data.length == 1) {
            core.replaceMatch(match, ":'trait_value':'"+match+"':", this.name);
          }
        })
      });

      this.query = fetch("https://vocab.audioblast.org/api/term/?shortname="+match)
      .then(res => res.json())
      .then(data => {
        if (data != null) {
          core.replaceMatch(match, ":'trait_value':'"+match+"':", this.name);
          $html  = "<h2>"+data.name+"</h2>";
          $html += "<p>"+data.description+"</p>";
          $html += "<p><a href='"+data.url+"'>"+data.url+"</a></p>"
          document.getElementById("susie").style.display = "block";
          document.getElementById("susie").innerHTML = $html;
        } 
      })


      this.query.then(d => {
        fetch("https://api.audioblast.org/data/traits/?trait="+match+"&page_size=1&output=nakedJSON")
        .then(res => res.json())
        .then(data => {
          if (data.length == 1) {
            core.replaceMatch(match, ":'trait':'"+match+"':", this.name);
          }
        })
      });
      },

    display(mode, matched, core) {      
      var filters = Array();
      var title = "";
      matched.forEach(element => {
        const parts = element.split(":");
        if (parts[1] == "'named_trait_with_value'") {
          title += parts[2].replaceAll("'", "")+" ";
          filters.push({
            field: "trait",
            type: "=",
            value: parts[3].replaceAll("'", "")
          });
          filters.push({
            field: "value",
            type: "=",
            value: parts[4].replaceAll("'", "")
          });

        } else if (parts[1] == "'trait_value'") {
          title += parts[2].replaceAll("'", "")+" ";
          filters.push({
            field: "value",
            type: "=",
            value: parts[2].replaceAll("'", "")
          });
        } else if (parts[1] == "'trait'") {
            title += parts[2].replaceAll("'", "")+" ";
            filters.push({
              field: "trait",
              type: "=",
              value: parts[2].replaceAll("'", "")
            });
          } else if (parts[1] == "'taxon_with_rank'") {
            const italicise = ['genus', 'species'];
            if (italicise.includes(parts[3].replaceAll("'", ""))) {
              title += "<i>"+parts[2].replaceAll("'", "")+"</i>";
            } else {
              title += parts[2].replaceAll("'", "")+" ";
            }
            filters.push({
              field: parts[3].replaceAll("'", ""),
              type: "=",
              value: parts[2].replaceAll("'", "")
            });
          }
        });
      if (title + JSON.stringify(filters) == this.current_display) {
        return;
      } else {
        this.traitsDisplay(title, filters);
        this.current_display = title + JSON.stringify(filters);
      }
    },

    traitsDisplay(title, filters) {
      var params = "";
      var first = true;
      if (filters.length == 0) { return; }
      filters.forEach(element => {
        if (first) {
          params += '?';
          first = false;
        } else {
          params += '&';
        }
        params += element.field+"="+element.value;
      })

      this.query = dataRequested = fetch("https://api.audioblast.org/data/traits/"+params+"&page_size=1&output=nakedJSON")
      .then(res => res.json())
      .then(data => {
        if (data.length == 1) {
          document.getElementById("solomon").innerHTML = '<h2>'+title+'</h2><div id="traits-tabulator" class="search-table"></div>';
          eval('generateTabulator("#traits-tabulator", "traitstaxa",'+JSON.stringify(filters)+');');
        } else {
          document.getElementById("solomon").style.display = "none";
        }
      })
    },

    searchSuggest(){
      return([
        "mandibular grinding",
        "tremulation",
        "silent"
      ]);
    }
  }
  
