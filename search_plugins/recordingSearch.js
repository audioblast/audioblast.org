/*
Watson search plugin for searchAB

The Watson plugin for searchAB is a plugin that processes the user's search query for recordings matching
the query. The recordings box is displayed if matches are found.

The plugin is named after Chris Watson, a sound recordist who has worked on many David Attenborough
nature documentaries.
*/
const recordingSearch = {
  name:"Watson",
  query: Promise.resolve(),
  current_display: "",
  displayPrototype() {
    const ret = {content:"watson"};
    return(ret);
  },

  parse() {},

  display(mode, matched, core) {
    var recordings = Array();
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
        recordings.push(element);
      }
    });
    // Recordings aren't shown for searches with a trait
    if (recordings.length > 0 && !hasTrait) {
      this.recordingsDisplay(recordings);
    } else {
      document.getElementById("watson").innerHTML = "";
      document.getElementById("watson").style.display = "none";
      this.current_display = "";
    }
  },
  recordingsDisplay(recordings) {
    recordings.forEach(matched => {
      if (this.current_display == matched) {
        return;
      } else {
        this.current_display=matched;
      }
      document.getElementById("watson").style.display = "block";
      const parts = matched.split(":");
      const taxon = parts[2].replaceAll("'", "");
      const rank  = parts[3].replaceAll("'", "").toLowerCase();
      var dataRequested = fetch(AB_API_BASE+"/data/recordingstaxa/?"+encodeURIComponent(rank)+"="+encodeURIComponent(taxon)+"&page_size=1&output=nakedJSON")
      .then(res => res.json())
      .then(data => {
        // Ignore the response if the box has since been emptied or moved on to another taxon
        if (this.current_display != matched) {
          return;
        }
        if (data.length == 1) {
          document.getElementById("watson").innerHTML = "<h2></h2><div id='recordingstaxa-tabulator' class='search-table'></div>";
          document.querySelector("#watson h2").textContent = "Recordings of "+rank+" "+taxon;
          generateTabulator("#recordingstaxa-tabulator", "recordingstaxa", {field:rank, type:"=", value:taxon});
        } else {
          // Emptied as well as hidden, so a table for an earlier taxon stops loading
          document.getElementById("watson").innerHTML = "";
          document.getElementById("watson").style.display = "none";
        }
      })
      .catch(function (error) {
      });
    });
  }
}
  