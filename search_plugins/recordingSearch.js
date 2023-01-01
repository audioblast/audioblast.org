const recordingSearch = {
    name:"Watson",
    urlParams: ["source","id"],
    mode: "recording",
    canParse(string, core) {
      core.parsed(this.name, false);
    },
    display(mode, matched) {
      if ("taxon" in matched) {
        var ret = '<div class="feature">';
        ret += "<h2>Recordings of "+matched["taxon"]+"</h2>";
        ret += '<div id="recordings-tabulator" class="search-table"></div>';
        const script = 'generateTabulator("#recordings-tabulator", "recordingstaxa", {field:"'+matched["rank"]+'", type:"=", value:"'+matched["taxon"]+'"});';
        return({html:ret, js:script});
      }
      return(false);
    }
  }