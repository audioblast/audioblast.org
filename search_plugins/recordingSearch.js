const recordingSearch = {
  name:"Watson",
  displayPrototype() {
    const ret = {content:"watson"};
    return(ret);
  },

  display(mode, matched) {
    if (matched.startsWith(":taxon_with_rank:")) {
      parts = matched.split(":");
      taxon = parts[2];
      rank  = parts[3].toLowerCase();
      var dataRequested = fetch("https://api.audioblast.org/data/recordingstaxa/?"+rank+"="+taxon+"&page_size=1&output=nakedJSON")
      .then(res => res.json())
      .then(data => {
        if (data.length == 1) {
          document.getElementById("watson").innerHTML += '<h2>Recordings-taxa</h2><div id="recordingstaxa-tabulator" class="search-table"></div>';
          eval('generateTabulator("#recordingstaxa-tabulator", "recordingstaxa", {field:"'+rank+'", type:"=", value:"'+taxon+'"});');
        }
      })
      .catch(function (error) {
      });
    }
  }
}
  