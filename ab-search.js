function arrayEquals(a, b) {
  return Array.isArray(a) &&
    Array.isArray(b) &&
    a.length === b.length &&
    a.every((val, index) => val === b[index]);
}

const searchAB = {
  name: "audioBLAST",
  consoleContainer: null,
  infoContainer: null,
  contentContainer: null,
  plugins: {},
  matched: [],
  urlParams: new URLSearchParams(window.location.search),
  mode: "search",

  setConsoleContainerId(container) {
    this.consoleContainer = container;
  },
  setInfoContainerId(container) {
    this.infoContainer = container;
  },
  setContentContainerId(container) {
    this.contentContainer = container;
  },

  consoleLog(plugin, message) {
    if (!(this.consoleContainer == null)) {
      document.getElementById(this.consoleContainer).innerHTML += "["+plugin+"] "+message+"<br>";
    }
  },

  addPlugin(plugin) {
    this.plugins[plugin.name] = plugin;
    if (Object.keys(this.plugins[plugin.name]).includes('displayPrototype')) {
      const div_info = this.plugins[plugin.name].displayPrototype();
      if ("info" in div_info && document.getElementById(this.infoContainer)) {
        document.getElementById(this.infoContainer).innerHTML += '<div id="'+div_info["info"]+'" class="feature"><div class="dot-carousel"></div></div>';
      }
      if ("content" in div_info && document.getElementById(this.contentContainer)) {
        document.getElementById(this.contentContainer).innerHTML += '<div id="'+div_info["content"]+'" class="feature"><div class="dot-carousel"></div>';
      }
    }
  },

  addMatch(match, module=null) {
    this.matched.push(match);
    this.consoleLog((module==null)?this.name:module, "New search term: "+match);
    this.parse(match);
    this.display(match);
  },

  init() {
    this.consoleLog(this.name, "I can talk to the animals...");
    //Set initial match 
    this.addMatch(this.urlParams.get("search"));
  },

  parse(match) {
    for (var i = 0; i < Object.keys(this.plugins).length; i++) {
      if ('parse' in Object.values(this.plugins)[i]) {
        Object.values(this.plugins)[i].parse(this.mode, match, this);
      }
    }
  },

  display(match) {
    for (var i = 0; i < Object.keys(this.plugins).length; i++) {
      if ('display' in Object.values(this.plugins)[i]) {
        Object.values(this.plugins)[i].display(this.mode, match, this);
      }
    }
  },

  searchSuggest(element) {
    for (var i = 0; i < Object.keys(this.plugins).length; i++) {
      if ('searchSuggest' in Object.values(this.plugins)[i]) {
        var suggestion = Object.values(this.plugins)[i].searchSuggest();
        if (suggestion != false) {
          suggestion.forEach(e => {
            html = '<a onclick="{'+"document.getElementById('search').value = '"+e+"';}"+'">'+e+"</a>";
            document.getElementById(element).innerHTML += html;
          });
        }
      }
    }    
  }
}
