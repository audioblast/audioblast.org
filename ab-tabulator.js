// API base URL, set from includes/config.php by the page where available
var AB_API_BASE = window.AB_API_BASE || "https://api.audioblast.org";

/**
 * Replace the contents of a table container with an error message
 * @param  {String} element String specifying the table container element
 * @param  {String} message message to display
 */
var showTableError = function(element, message) {
  var container = document.querySelector(element);
  if (container) {
    container.textContent = message;
  }
}

/**
 * Create a Tabulator for data from audioBlast API
 * @param  {String} element String specifying element to create Tabulator within
 * @param  {String} table name of audioBlast table to retreieve data from
 * @param  {Array}  iFilter initial filters to apply to the table
 */
var generateTabulator = function(element, table, iFilter=[]) {
  if (!Array.isArray(iFilter)) {
    iFilter = [iFilter];
  }
  // Found now, as a search plugin may replace the container with another of the same id while the columns load
  var container = document.querySelector(element);
  // The module's parameters say which of its fields can be suggested. Only the suggestions are
  // lost if this fails, so the table is still built from whatever comes back.
  var paramsRequested = fetch(AB_API_BASE+"/standalone/modules/module_info/?module="+encodeURIComponent(table)+"&output=nakedJSON")
    .then(function(res) {
      return res.json();
    })
    .then(function(info) {
      return (info !== null && typeof info === "object" && info.params !== null && typeof info.params === "object") ? info.params : {};
    })
    .catch(function (error) {
      return {};
    });
  var xhr = new XMLHttpRequest();
  xhr.open("GET", AB_API_BASE+"/data/"+table+"/columns/?output=nakedJSON", true);
  xhr.extraInfo = [element, table];
  xhr.onload = function (e) {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        var table = this.extraInfo[1];
        var element = this.extraInfo[0];
        if (container === null || !container.isConnected) {
          // The container was removed while the columns loaded, e.g. a search plugin emptied or replaced its box
          return;
        }
        var cols = null;
        try {
          cols = JSON.parse(this.responseText);
        } catch (err) {
          // Handled below
        }
        if (!Array.isArray(cols)) {
          console.error("Unexpected columns response for " + table + ": " + this.responseText.slice(0, 200));
          showTableError(element, "Could not load this table. Please try again later.");
          return;
        }
        paramsRequested.then(function(moduleParams) {
          // Checked again, as the container may have gone while the parameters loaded
          if (container === null || !container.isConnected) {
            return;
          }
          var ajaxURL = AB_API_BASE+'/data/'+table+'/';
          var initialFilters = iFilter;
          const urlSearchParams = new URLSearchParams(window.location.search);
          const params = Object.fromEntries(urlSearchParams.entries());
          const keys = Object.keys(params);
          if (keys.includes("page")) {
            // `page` names the page of the site, not a filter, and whatever else the address
            // carries is a filter only if the module can be filtered by it. The API refuses a
            // filter it does not recognise, so a shared link arriving with utm_source or fbclid
            // on it would otherwise take the whole table down with it.
            keys.filter(key => key != "page" && canFilterBy(moduleParams, key))
              .forEach(key => initialFilters.push({field:key, type:"=", value:params[key]}));
          }
          if (typeof(filterAB) !== 'undefined') {
            switch (element) {
              case "#search-same-species":
                initialFilters.push({field:"taxon", type:"=", value:filterAB['taxon']});
                break;
            }
          }
          var tabletabulator = new Tabulator(container, {
             columns:parseColumns(cols, table, moduleParams),
             ajaxURL:ajaxURL,
             progressiveLoad:"scroll",
             filterMode:"remote",
             paginationSize:50,
             dataSendParams:{
               "size":"page_size",
             },
             initialFilter:initialFilters,
             ajaxResponse:function(url, params, response) {
               // Tabulator loads the next page while the rows don't fill the table, which is always the case once
               // the container has been removed from the page, so a removed table stops at this page
               if (!container.isConnected) {
                 response.last_page = params.page;
               }
               return response;
             }
          });
          tabletabulator.on("rowDblClick", function(e, row){
            const data =row.getData();
            var url = null;
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get("page")=="recordings") {
              url = "https://view.audioblast.org/?source="+data['source']+"&id="+data['id'];
            }
            //audioBLAST page
            if (typeof(filterAB) !== 'undefined') {
              url = "https://view.audioblast.org/?source="+data['source']+"&id="+data['id'];
            }
            if (url != null) {
              window.open(url, "_self");
            }
          });
        });
      } else {
        console.error("Failed to load columns for " + this.extraInfo[1] + ": HTTP " + xhr.status);
        showTableError(this.extraInfo[0], "Could not load this table. Please try again later.");
      }
    }
  };
  xhr.onerror = function (e) {
    console.error("Failed to load columns for " + table + ": network error");
    showTableError(element, "Could not load this table. Please try again later.");
  };
  xhr.send(null);
}

/**
 * Whether a module can be filtered by a field, as its own parameters report it. A field it
 * declares but gives no operator for cannot be filtered on, and the API refuses a filter on it
 * just as it refuses one on a field it has never heard of.
 * @param  {Object} moduleParams the module's parameters, from module_info
 * @param  {String} field name of the field to filter by
 * @return {Boolean} true if the API will honour a filter on the field
 */
var canFilterBy = function(moduleParams, field) {
  const param = (moduleParams === null || typeof moduleParams !== "object") ? null : moduleParams[field];
  if (param === null || typeof param !== "object") {
    return(false);
  }
  return(param["op"] != null && param["op"] != "" && param["op"] != "none");
}

/**
 * Parse columns from audioBlast to add specific Tabulator behaviour
 * @param  {Array}  cols column information
 * @param  {String} table name of the audioBlast table the columns are of
 * @param  {Object} moduleParams the table's parameters, saying which fields can be suggested
 * @return {Array} modified column data
 */
var parseColumns = function(cols, table, moduleParams) {
  moduleParams = (moduleParams === null || typeof moduleParams !== "object") ? {} : moduleParams;
  var playable = false;
  for (var i = 0; i < cols.length; i++) {
    if (cols[i]["field"] == "filename") {
      playable = true;
    }
    //vocabulary term addresses: trait_ontology in traits, url in traitstaxa
    if (cols[i]["field"] == "trait_ontology" || cols[i]["field"] == "url") {
      cols[i]["formatter"] = linkFormatter;
    }
    if (cols[i]["headerFilter"] == "range") {
      cols[i]["headerFilter"] = minMaxFilterEditor;
      cols[i]["headerFilterFunc"] = minMaxFilterFunction;
      continue;
    }
    // A field the API can suggest values for gets a filter that offers them as they are typed
    var param = moduleParams[cols[i]["field"]];
    if (cols[i]["headerFilter"] && param != null && param["autocomplete"] === true) {
      cols[i]["headerFilter"] = autocompleteFilterEditor(table, cols[i]["field"]);
    }
  }
  if (playable) {
    cols.unshift(playColumn());
  }
  return(cols);
}

/**
 * Header filter that suggests the values a field holds, from the API's autocomplete endpoint.
 * The suggestions are a datalist, so the filter still takes any text typed into it.
 * @param  {String} table name of the audioBlast table
 * @param  {String} field name of the field to suggest values of
 * @return {Function} a Tabulator header filter editor
 */
var autocompleteFilterEditor = function(table, field) {
  return function(cell, onRendered, success, cancel, editorParams) {
    var container = document.createElement("span");
    container.className = "ab-autocomplete";
    var input = document.createElement("input");
    input.setAttribute("type", "text");
    input.setAttribute("placeholder", "Filter...");
    // Off, so the browser's own history does not cover the suggestions
    input.setAttribute("autocomplete", "off");
    var list = document.createElement("datalist");
    list.id = "ab-suggestions-"+table+"-"+field;
    input.setAttribute("list", list.id);
    input.value = cell.getValue() || "";

    // Only the newest request fills the list, so a slow answer never replaces a newer one
    var generation = 0;
    var suggesting = null;
    var filtering = null;

    function suggest() {
      var value = input.value.trim();
      if (value == "") {
        list.replaceChildren();
        return;
      }
      generation++;
      var mine = generation;
      fetch(AB_API_BASE+"/data/"+encodeURIComponent(table)+"/autocomplete/"+encodeURIComponent(field)+"/?c="+encodeURIComponent(value)+"&output=nakedJSON")
        .then(function(res) {
          return res.json();
        })
        .then(function(data) {
          if (mine != generation || !Array.isArray(data)) {
            return;
          }
          var options = [];
          data.forEach(function(row) {
            var suggestion = (row === null) ? null : row[field];
            if (typeof suggestion == "string" && suggestion != "") {
              var option = document.createElement("option");
              option.value = suggestion;
              options.push(option);
            }
          });
          list.replaceChildren(...options);
        })
        .catch(function (error) {
        });
    }

    function filter() {
      success(input.value);
    }

    // Suggestions come while typing; the filter itself waits until the typing stops, so a word
    // is not sent to the API a letter at a time
    input.addEventListener("input", function() {
      clearTimeout(suggesting);
      clearTimeout(filtering);
      suggesting = setTimeout(suggest, 200);
      filtering = setTimeout(filter, 700);
    });
    input.addEventListener("change", function() {
      clearTimeout(filtering);
      filter();
    });
    input.addEventListener("keydown", function(e) {
      if (e.key === "Enter") {
        clearTimeout(filtering);
        filter();
      }
      if (e.key === "Escape") {
        cancel();
      }
    });

    container.appendChild(input);
    container.appendChild(list);
    return(container);
  };
}

/**
 * A column of buttons that play a recording, for tables whose rows carry the address of a file
 * @return {Object} Tabulator column definition
 */
var playColumn = function() {
  return {
    title:"",
    field:"ab_play",
    headerSort:false,
    width:44,
    formatter:function(cell) {
      const data = cell.getRow().getData();
      if (!data["filename"]) {
        return "";
      }
      const button = document.createElement("button");
      button.type = "button";
      button.className = "ab-play";
      button.textContent = "▶";
      button.setAttribute("aria-label", "Play this recording");
      button.addEventListener("click", function(e) {
        e.stopPropagation();
        playRecording(data);
      });
      return(button);
    }
  };
}

// The page's player, made when a recording is first played
var abPlayer = null;

/**
 * The page's audio player, shared by every table on it, so that playing a recording stops the
 * one playing before it
 * @return {Object} the player's bar, title and audio elements
 */
var audioPlayer = function() {
  if (abPlayer != null) {
    return(abPlayer);
  }
  const bar = document.createElement("div");
  bar.id = "ab-player";
  const title = document.createElement("p");
  title.id = "ab-player-title";
  const audio = document.createElement("audio");
  audio.id = "ab-player-audio";
  audio.controls = true;
  const close = document.createElement("button");
  close.type = "button";
  close.id = "ab-player-close";
  close.textContent = "×";
  close.setAttribute("aria-label", "Close the player");
  close.addEventListener("click", function() {
    audio.pause();
    bar.style.display = "none";
  });
  bar.appendChild(title);
  bar.appendChild(audio);
  bar.appendChild(close);
  document.body.appendChild(bar);
  abPlayer = {bar:bar, title:title, audio:audio};
  return(abPlayer);
}

/**
 * Play a recording in the page's player
 * @param  {Object} data the row the recording is in
 */
var playRecording = function(data) {
  const player = audioPlayer();
  // Text rather than markup, as the name comes from the recording's source
  player.title.textContent = data["name"] || data["taxon"] || data["filename"];
  player.audio.src = data["filename"];
  player.bar.style.display = "flex";
  player.audio.play()
    .catch(function (error) {
      // The browser may refuse a format it cannot play; its controls stay for the listener to try
    });
}

/**
 * Tabulator formatter to show a web address as a link
 * Only http and https addresses become links, so data can't create a javascript: link
 * @param  {CellComponent} cell cell to format
 * @return {Node|String} link, text, or a space for an empty cell
 */
var linkFormatter = function(cell) {
  var value = cell.getValue();
  if (value === null || value === undefined || value === "") {
    //as Tabulator's plain text formatter does
    return("&nbsp;");
  }
  value = String(value);
  if (!/^https?:\/\//i.test(value)) {
    return(document.createTextNode(value));
  }
  var link = document.createElement("a");
  link.href = value;
  link.textContent = value;
  return(link);
}

/**
 * Helper function to  get field data from audioBlast column information
 * @param  {Array} cols column information
 * @return {Array} field information
 */
var columnFields = function(cols) {
  var names = [];
  for (var i = 0; i < cols.length; i++) {
    names.push(cols[i]["field"]);
  }
  return(names);
}

var minMaxFilterEditor = function(cell, onRendered, success, cancel, editorParams){
  var end;
  var container = document.createElement("span");

  //create and style inputs
  var start = document.createElement("input");
  start.setAttribute("type", "number");
  start.setAttribute("placeholder", "Min");
  start.style.padding = "4px";
  start.style.width = "50%";
  start.style.boxSizing = "border-box";

  //restore any existing range
  var current = cell.getValue() || {};
  start.value = current.start || "";

  function buildValues() {
    if (start.value === "" && end.value === "") {
      //clear the filter rather than sending an empty range
      success("");
      return;
    }
    success({
      start:start.value,
      end:end.value,
    });
  }

  function keypress(e) {
    if (e.keyCode == 13) {
      buildValues();
    }

    if (e.keyCode == 27){
      cancel();
    }
  }

  end = start.cloneNode();
  end.setAttribute("placeholder", "Max");
  end.value = current.end || "";

  start.addEventListener("change", buildValues);
  start.addEventListener("blur", buildValues);
  start.addEventListener("keydown", keypress);

  end.addEventListener("change", buildValues);
  end.addEventListener("blur", buildValues);
  end.addEventListener("keydown", keypress);

  container.appendChild(start);
  container.appendChild(end);

  return(container);
 }


 //Custom min/max filter function
function minMaxFilterFunction(headerValue, rowValue, rowData, filterParams){
  //compare as numbers; values arrive from the API as strings
  var value = parseFloat(rowValue);
  var min = parseFloat(headerValue.start);
  var max = parseFloat(headerValue.end);
  if (isNaN(min) && isNaN(max)) {return true;}
  if (isNaN(value)) {return false;}
  if (!isNaN(min) && value < min) {return false;}
  if (!isNaN(max) && value > max) {return false;}
  return true; //must return a boolean, true if it passes the filter.
}
