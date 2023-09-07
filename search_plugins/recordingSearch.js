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
    matched.forEach(element => {
      if (element.startsWith(":'named_trait_with_value':'Silent taxa':")) {
        document.getElementById("watson").inerHTML = "";
        document.getElementById("watson").style.display = "none";
        return;
      }
      if (element.startsWith(":'taxon_with_rank':")) {
        recordings.push(element);
      }
    });
    if (recordings.length > 0 ) {
      this.recordingsDisplay(recordings);
    } else {
      document.getElementById("watson").inerHTML = "";
      document.getElementById("watson").style.display = "none";
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
      parts = matched.split(":");
      taxon = parts[2].replaceAll("'", "");
      rank  = parts[3].replaceAll("'", "").toLowerCase();
      var dataRequested = fetch("https://api.audioblast.org/data/recordingstaxa/?"+rank+"="+taxon+"&page_size=1&output=nakedJSON")
      .then(res => res.json())
      .then(data => {
        if (data.length == 1) {
          document.getElementById("watson").innerHTML = '<h2>Recordings-taxa</h2><div id="recordingstaxa-tabulator" class="search-table"></div>';
          eval('generateTabulator("#recordingstaxa-tabulator", "recordingstaxa", {field:"'+rank+'", type:"=", value:"'+taxon+'"});');
        } else {
          document.getElementById("watson").style.display = "none";
        }
      })
      .catch(function (error) {
      });
    });
  }
}
  