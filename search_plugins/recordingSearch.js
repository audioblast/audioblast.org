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
  