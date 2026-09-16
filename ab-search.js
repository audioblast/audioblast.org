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
  pythiaContainer: "pythia",
  plugins: {},
  matched: Array(),
  old_matches: Array(),
  urlParams: new URLSearchParams(window.location.search),
  query: Promise.resolve(),
  query_remaining: null,
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
    const container = (this.consoleContainer == null) ? null : document.getElementById(this.consoleContainer);
    if (container) {
      container.appendChild(document.createTextNode("["+plugin+"] "+message));
      container.appendChild(document.createElement("br"));
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

  replaceMatch(old_match, new_match, module=null) {
    if (this.matched.includes(new_match)) {return;}
    if (this.old_matches.includes(old_match)) {return;}

    if (!this.matched.includes(old_match)) {this.matched.push(old_match);}
    this.old_matches.push(old_match);
    const index = this.matched.indexOf(old_match);
    this.matched[index] = new_match
    this.consoleLog((module==null)?this.name:module, "Replaced match: "+old_match+" with "+new_match);

    let term = document.getElementById("pythia-term-"+encodeURI(old_match));
    if (!term) {
      term = document.createElement("div");
      term.id = "pythia-term-"+encodeURI(old_match);
      term.textContent = old_match;
      document.getElementById("pythia-terms").appendChild(term);
    }
    const replacement = document.createElement("span");
    replacement.id = "pythia-term-"+encodeURI(new_match);
    replacement.textContent = new_match;
    term.appendChild(document.createTextNode(" => "));
    term.appendChild(replacement);
  
    this.query_remaining = this.query_remaining.replaceAll(old_match, "");
    this.query_remaining = this.query_remaining.replaceAll(new_match, "").trim();

    this.query.then(d => {
      this.parse(new_match);
      this.display(new_match);
    });


    if (this.query_remaining != "") {
      this.parse(this.query_remaining);
      this.display(this.query_remaining);
    }
  },

  init() {
    var query_string = this.urlParams.get("search");
    if (query_string == null) {
      return;
    }
    query_string = query_string.replaceAll("?", "");

    this.query_remaining = query_string;
    this.consoleLog(this.name, "New query: "+query_string);
    this.query.then(d => {
      this.parse(query_string);
      this.display(query_string);
    })
  },

  parse(match) {
    for (var i = 0; i < Object.keys(this.plugins).length; i++) {
      this.query.then(Object.values(this.plugins)[i].query.then(Object.values(this.plugins)[i].parse(this.mode, match, this)));
    }
  },

  display(match) {
    this.pythia(match);
    this.query.then(e => {
      for (var i = 0; i < Object.keys(this.plugins).length; i++) {
        if ('display' in Object.values(this.plugins)[i]) {
          this.query.then(Object.values(this.plugins)[i].query.then(Object.values(this.plugins)[i].display(this.mode, this.matched, this)));
        }
      }
    })
  },

  searchSuggest(element) {
    for (var i = 0; i < Object.keys(this.plugins).length; i++) {
      if ('searchSuggest' in Object.values(this.plugins)[i]) {
        var suggestion = Object.values(this.plugins)[i].searchSuggest();
        if (suggestion != false) {
          suggestion.forEach(e => {
            //A button, so the suggestion can be reached and chosen with the keyboard
            const button = document.createElement("button");
            button.type = "button";
            button.textContent = e;
            button.addEventListener("click", () => {
              const search = document.getElementById("search");
              search.value = e;
              search.focus();
            });
            document.getElementById(element).appendChild(button);
          });
        }
      }
    }    
  },

  pythiaQueryCount: 0,
  pythia(match) {
    if (this.pythiaQueryCount == 0) {
      document.getElementById("pythia-query").textContent = this.urlParams.get("search");
    }
    this.pythiaQueryCount++;
    match = match.replace(/(:'([A-z]| |_)+')+:/, "");
    
    this.query = fetch(AB_API_BASE+"/standalone/pythia/process/?query="+encodeURIComponent(match))
      .then(res => res.json())
      .then(data => {
        data = data.data;

        if ("taxa" in data) {
          data.taxa.forEach(element => {
            this.replaceMatch(element.match, ":'taxon':'"+element.match+"':", "Pythia");
          });
        }
      })
      .catch(function (error) {
      }); 
  }
}
