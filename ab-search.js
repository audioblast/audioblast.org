function arrayEquals(a, b) {
  return Array.isArray(a) &&
    Array.isArray(b) &&
    a.length === b.length &&
    a.every((val, index) => val === b[index]);
}

const searchAB = {
  consoleContainer: "menu",
  plugins: {},
  name: "audioBLAST!",
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
  searchSuggest(element) {
    var suggestions = [];
    for (var i = 0; i < Object.keys(this.plugins).length; i++) {
      if ('searchSuggest' in Object.values(this.plugins)[i]) {
        var suggestion = Object.values(this.plugins)[i].searchSuggest();
        if (suggestion != false) {
          suggestion.forEach(e => {
            suggestions.push(e);
          });
        }
      }
    }
    var html = '';
    suggestions.forEach(e => {
      html += '<a onclick="{'+
        "document.getElementById('search').value = '"+e+"';}" + '">';
      html += e
      html += "</a>";
    });
    document.getElementById(element).innerHTML = html;
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
          core.matched["rank"] = this.data["rank"].toLowerCase();
          core.parsed(this.name, "taxon", string);
          return;
        }
        core.parsed(this.name, false);
      })
      .catch(function (error) {
    });
    this.data = dataRequested;
    return;
  },
  urlParams: ["taxon"],
  mode: "taxon",
  display(mode, matched) {
    if ("taxon" in matched) {
      var ret = '<div id="search-result-taxon" class="feature">';
      Promise.resolve(this.data).then(ret += this.displayTaxon(matched)
      );
      ret += "</div";
      return({html:ret});
    }
    return(false);
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
  },
  searchSuggest(){
    return([
      "Gryllotalpa vineae"
    ]);
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
      const script = 'generateTabulator("#recordings-tabulator", "recordingstaxa", {field:"'+matched["rank"]+'", type:"=", value:"'+matched["taxon"]+'"});';
      return({html:ret, js:script});
    }
    return(false);
  }
}

const traitSearch = {
  name:"TraitBot",
  urlParams: ["trait"],
  mode: "trait",
  canParse(string, core) {
    if (string.toLowerCase() == "silent") {
      core.matched["trait"] = {trait:"Sound Production Method", value:"None"};
      core.parsed(this.name, "trait", "Silent taxa");
      return;
    }

    var dataRequested = fetch("https://api.audioblast.org/data/traits/?trait="+string+"&output=nakedJSON")
      .then(res => res.json())
      .then(data => {
        if (data.length > 0) {
          core.parsed(this.name, "trait", "Silent taxa");
          return;
        }
        core.parsed(this.name, false);
      })
      .catch(function (error) {
      });
  },
  display(mode, matched) {
    if ("taxon"in matched) {
      var ret = '<div class="feature">';
      ret += "<h2>Traits "+matched["taxon"]+"</h2>";
      ret += '<div id="traits-tabulator" class="search-table"></div>';
      const script = 'generateTabulator("#traits-tabulator", "traitstaxa", {field:"'+matched["rank"]+'", type:"=", value:"'+matched["taxon"]+'"});';

      return({html:ret, js:script});
    }
    if ("trait" in matched) {
      var ret = '<div class="feature">';
      var script = '';
      ret += "<h2>"+matched["trait"]+"</h2>";
      ret += '<div id="traits-tabulator" class="search-table"></div>';
      if (matched["trait"] == "Silent taxa") {
        script = 'generateTabulator("#traits-tabulator", "traits", ['+
                          '{field:"trait", type:"=", value:"Sound Production Method"},'+
                          '{field:"value", type:"=", value:"None"}'+
                        ']);';
      } else {
        script = 'generateTabulator("#traits-tabulator", "traits", {field:"trait", type:"=", value:"'+matched["trait"]+'"});';
      }
      return({html:ret, js:script});
    }
    return(false);
  },
  searchSuggest() {
  return([
    "silent"
  ]);
  }
}

const KSR = {
  name:"King Solomon's Ring",
  canParse(string, core) {
    var dataRequested = fetch("https://api.audioblast.org/data/traits/list_text_values/?output=nakedJSON")
      .then(res => res.json())
      .then(data => {
        if (data.length > 0) {
          if (data.includes(string.toLowerCase())) {
            core.parsed(this.name, "trait.value", string);
          }
          return;
        }
        core.parsed(this.name, false);
      })
      .catch(function (error) {
    });
  },
  display(mode, matched) {
    if ("trait.value" in matched) {
      var ret = '<div class="feature">';
      var script = '';
      ret += "<h2>"+matched["trait.value"]+"</h2>";
      ret += '<div id="traitsvalue-tabulator" class="search-table"></div>';
      script = 'generateTabulator("#traitsvalue-tabulator", "traits", {field:"value", type:"=", value:"'+matched["trait.value"]+'"});';
      return({html:ret, js:script});
    }
  }
}

const emojiReplace = {
  name:"Rosetta",
  preParse(string, core) {
    if(string == "🦗")  {
      core.consoleLog(this.name, "Interpreted 🦗 as Orthoptera.");
      return("Orthoptera");
    }
    return(string);
  },
  canParse(string, core) {
    core.parsed(this.name, false);
  },
  searchSuggest() {
    return(["🦗"]);
  }
}

searchAB.addPlugin(emojiReplace);
searchAB.addPlugin(taxonSearch);
searchAB.addPlugin(recordingSearch);
searchAB.addPlugin(traitSearch);
searchAB.addPlugin(KSR);
