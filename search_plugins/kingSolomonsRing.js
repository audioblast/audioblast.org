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
      return {info: "susie", content: "solomon"};
    },

    escapeHTML(text) {
      const div = document.createElement("div");
      div.textContent = text;
      return div.innerHTML;
    },

    showTraitInfo(data) {
      const box = document.getElementById("susie");
      const heading = document.createElement("h2");
      heading.textContent = data.name;
      const description = document.createElement("p");
      description.textContent = data.description;
      box.replaceChildren(heading, description);
      if (/^https?:\/\//i.test(data.url)) {
        const link = document.createElement("a");
        link.href = data.url;
        link.textContent = data.url;
        const linkParagraph = document.createElement("p");
        linkParagraph.appendChild(link);
        box.appendChild(linkParagraph);
      }
      box.style.display = "block";
    },

    parse(mode, match, core) {
      if (match == "silent") {
        core.replaceMatch("silent", ":'named_trait_with_value':'Silent taxa':'Sound Production Method':'None':", this.name);
        return;
      }

      //TODO: Below use text_traits API
      this.query.then(d => {
        fetch(AB_API_BASE+"/data/traits/?value="+encodeURIComponent(match)+"&page_size=1&output=nakedJSON")
        .then(res => res.json())
        .then(data => {
          if (data.length == 1) {
            core.replaceMatch(match, ":'trait_value':'"+match+"':", this.name);
          }
        })
      });

      this.query.then(d => {
        fetch("https://vocab.audioblast.org/api/term/?shortname="+encodeURIComponent(match))
        .then(res => res.json())
        .then(data => {
          if (data != null && data.hasOwnProperty("shortname")) {
            core.replaceMatch(match, ":'trait_value':'"+match+"':", this.name);
            this.showTraitInfo(data);
          } 
        })
      })
      
      this.query.then(d => {
        fetch("https://vocab.audioblast.org/api/term/?name="+encodeURIComponent(match))
        .then(res => res.json())
        .then(data => {
          if (data != null && data.hasOwnProperty("shortname")) {
            core.replaceMatch(match, ":'trait_value':'"+match+"':", this.name);
            this.showTraitInfo(data);
          } 
        })
      })

      this.query.then(d => {
        fetch(AB_API_BASE+"/data/traits/?trait="+encodeURIComponent(match)+"&page_size=1&output=nakedJSON")
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
          title += this.escapeHTML(parts[2].replaceAll("'", ""))+" ";
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
          title += this.escapeHTML(parts[2].replaceAll("'", ""))+" ";
          filters.push({
            field: "value",
            type: "=",
            value: parts[2].replaceAll("'", "")
          });
        } else if (parts[1] == "'trait'") {
            title += this.escapeHTML(parts[2].replaceAll("'", ""))+" ";
            filters.push({
              field: "trait",
              type: "=",
              value: parts[2].replaceAll("'", "")
            });
          } else if (parts[1] == "'taxon_with_rank'") {
            const italicise = ['genus', 'species'];
            if (italicise.includes(parts[3].replaceAll("'", ""))) {
              title += "<i>"+this.escapeHTML(parts[2].replaceAll("'", ""))+"</i> ";
            } else {
              title += this.escapeHTML(parts[2].replaceAll("'", ""))+" ";
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
      if (filters.length === 0) { return; }
      let params = filters.map(element => `${encodeURIComponent(element.field)}=${encodeURIComponent(element.value)}`).join('&');
      params = `?${params}`;

      this.query = fetch(AB_API_BASE+"/data/traitstaxa/"+params+"&page_size=1&output=nakedJSON")
      .then(res => res.json())
      .then(data => {
        if (data.length == 1) {
          document.getElementById("solomon").innerHTML = '<h2>Traits for '+title+'</h2><div id="traits-tabulator" class="search-table"></div>';
          generateTabulator("#traits-tabulator", "traitstaxa", filters.slice());
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
  
