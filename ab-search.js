document.addEventListener("DOMContentLoaded", function(event) {
  searchAB.addPlugin(taxonSearch);
  searchAB.addPlugin(recordingSearch);
  searchAB.addPlugin(emojiReplace);
  searchAB.init();
});

function arrayEquals(a, b) {
  return Array.isArray(a) &&
    Array.isArray(b) &&
    a.length === b.length &&
    a.every((val, index) => val === b[index]);
}

const searchAB = {
  consoleContainer: "menu",
  plugins: {},
  name: "King Solomon's Ring",
  mode: null,
  matched: {},
  parsedData: {},
  parsed(plugin, mode, match) {
    this.parsedData[plugin]= mode
    if (mode != false) {
      this.consoleLog(plugin, "I can interpret the search term.");
      this.matched[mode] = match;
      this.setMode(mode);
    }
    this.allParsed();
  },
  allParsed() {
    if(Object.keys(this.plugins).length == Object.keys(this.parsedData).length) {
      this.consoleLog(this.name, "All plugins have had the opportunity to parse the search term.");
      this.display();
    }
  },
  urlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    return(Array.from(urlParams.keys()));
  },
  addPlugin(plugin) {
    this.plugins[plugin.name] = plugin;
  },
  preParse(string) {
    for (var i = 0; i < Object.keys(this.plugins).length; i++) {
      if ('preParse' in Object.values(this.plugins)[i]) {
        string = Object.values(this.plugins)[i].preParse(string, this);
      }
    }
    return(string);
  },
  canParse(string) {
    string = this.preParse(string);
    for (var i = 0; i < Object.keys(this.plugins).length; i++) {
      if ('canParse' in Object.values(this.plugins)[i]) {
        Object.values(this.plugins)[i].canParse(string, this);
      }
    }
  },
  display() {
    for (var i = 0; i < Object.keys(this.plugins).length; i++) {
      if ('display' in Object.values(this.plugins)[i]) {
        var response = Object.values(this.plugins)[i].display(this.mode, this.matched);
        if (response != false) {
          if ("html" in response) {
            document.getElementById("search-results").innerHTML += response.html;
          }
          if ("js" in response) {
            eval(response.js);
          }
        }
      }
    }
  },

  consoleLog(plugin, message) {
    document.getElementById(this.consoleContainer).innerHTML += "["+plugin+"] "+message+"<br>";
  },
  setMode(mode) {
    this.mode = mode;
    this.consoleLog(this.name, "Set mode to: "+this.mode);
  },
  init() {
    this.consoleLog(this.name, "I can talk to the animals...");
    const urlParams = new URLSearchParams(window.location.search);

    //If just search is set then need to figure out what plugins can process the search term
    if (arrayEquals(this.urlParams(), ["search"])) {
      this.setMode("audioBLAST!");
      //See if any plugins can parse the search term
      this.consoleLog(this.name, "Trying to parse search term.");
      this.canParse(urlParams.get("search"));
      return;
    }

    //See if other plugins provide matching URL params to set mode automatically
    for (var i = 0; i < Object.keys(this.plugins).length; i++) {
      if ('urlParams' in Object.values(this.plugins)[i]) {
        if (arrayEquals(Object.values(this.plugins)[i].urlParams, this.urlParams())) {
          this.consoleLog(this.name, "URL parameters match with plugin: "+Object.values(this.plugins)[i].name);
          this.setMode(Object.values(this.plugins)[i].mode);
          this.matched[this.mode] = this.preParse(urlParams.get(this.mode));
        }
      }
    }
    this.display();
  },
}

const taxonSearch = {
  name: "Linnaeus",
  data: null,
  canParse(string, core) {
    var dataRequested = fetch("https://api.audioblast.org/data/taxa/?taxon="+string+"&output=nakedJSON")
      .then(res => res.json())
      .then(data => {
        if (data.length == 1) {
          this.data = data[0];
          core.parsed(this.name, "taxon", string);
          return;
        }
        core.parsed(this.name, false);
      })
      .catch(function (error) {
      });
  },
  urlParams: ["taxon"],
  mode: "taxon",
  display(mode, matched) {
    if ("taxon" in matched) {
      var ret = '<div id="search-result-taxon" class="feature">';
      if (this.data == null) {
        const dataRequested = fetch("https://api.audioblast.org/data/taxa/?taxon="+matched["taxon"]+"&output=nakedJSON")
          .then(res => res.json())
          .then(data => {
            if (data.length == 1) {
              this.data = data[0];
              document.getElementById("search-result-taxon").innerHTML = this.displayTaxon(matched);
            }
          })
          .catch(function (error) {
        });
      } else {
        ret += this.displayTaxon(matched);
      }
      ret += "</div";
      return({html:ret});
    }
  },
  displayTaxon(matched) {
    if (this.data != null) {
      var ret = '<h2>'+this.data["rank"]+": "+this.data["taxon"]+'</h2>';
      const ranks = [
        "kingdom",
        "class",
        "order",
        "suborder",
        "family",
        "subfamily",
        "tribe",
        "genus",
        "species"
      ];
      var first = true;
      ranks.forEach(element => {
        if (this.data[element] != null) {
          if (!first) {
            ret += " > ";
          }
          ret += '<a href="audioblast.php?taxon='+this.data[element]+'">'+this.data[element]+"</a>";
          first = false;
        }
      });
    }
    return(ret);
  }
}

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
      const script = 'generateTabulator("#recordings-tabulator", "recordings", {field:"taxon", type:"=", value:"'+matched["taxon"]+'"});';
      return({html:ret, js:script});
    }
    return(false);
  }
}

const emojiReplace = {
  name:"Georgia",
  preParse(string, core) {
    if(string == "🦗")  {
      core.consoleLog(this.name, "Interpreted 🦗 as Orthoptera.");
      return("Orthoptera");
    }
    return(string);
  },
  canParse(string, core) {
    core.parsed(this.name, false);
  }
}
