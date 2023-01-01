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
