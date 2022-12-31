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
  var xhr = new XMLHttpRequest();
  xhr.open("GET", "https://api.audioblast.org/data/"+table+"/columns/?output=nakedJSON", true);
  xhr.extraInfo = [element, table];
  xhr.onload = function (e) {
    if (xhr.readyState === 4) {
      if (xhr.status === 200) {
        var table = this.extraInfo[1];
        var element = this.extraInfo[0];
        var cols = JSON.parse(this.responseText);
        var ajaxURL = 'https://api.audioblast.org/data/'+table+'/';
        var initialFilters = iFilter;
        const urlSearchParams = new URLSearchParams(window.location.search);
        const params = Object.fromEntries(urlSearchParams.entries());
        const keys = Object.keys(params);
        if (keys.includes("page")) {
          for (let i=0; i < keys.length; i++) {
            switch(keys[i]) {
              case "page":
                break;
              default:
                initialFilters.push({field:keys[i], type:"=", value:params[keys[i]]});
            }
          }
        }
        if (typeof(filterAB) !== 'undefined') {
          switch (element) {
            case "#search-same-species":
              initialFilters.push({field:"taxon", type:"=", value:filterAB['taxon']});
              break;
          }
        }
        var tabletabulator = new Tabulator(element, {
           columns:parseColumns(cols),
           //height:"100%",
           ajaxURL:ajaxURL,
           progressiveLoad:"scroll",
           progressiveLoadScrollMargin:30,
           filterMode:"remote",
           paginationSize:50,
           dataSendParams:{
             "size":"page_size",
           },
           initialFilter:initialFilters
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
      } else {
        console.error(xhr.statusText);
      }
    }
  };
  xhr.onerror = function (e) {
    console.error(xhr.statusText);
  };
  xhr.send(null);
}

/**
 * Parse columns from audioBlast to add specific Tabulator behaviour
 * @param  {Array} cols column information
 * @return {Array} modified column data
 */
var parseColumns = function(cols) {
  for (var i = 0; i < cols.length; i++) {
    if (cols[i]["headerFilter"] == "range") {
      cols[i]["headerFilter"] = minMaxFilterEditor;
      cols[i]["headerFilterFunc"] = minMaxFilterFunction;
    }
  }
  return(cols);
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
  start.setAttribute("min", 0);
  start.setAttribute("max", 100);
  start.style.padding = "4px";
  start.style.width = "50%";
  start.style.boxSizing = "border-box";

  start.value = cell.getValue();

  function buildValues() {
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
  if (rowValue) {
    if (rowValue == null) {return false;}
    if (headerValue.start != "") {
      if (headerValue.end != "") {
        return rowValue >= headerValue.start && rowValue <= headerValue.end;
      } else {
        return rowValue >= headerValue.start;
      }
    } else {
      if (headerValue.end != "") {
        return rowValue <= headerValue.end;
      }
    }
  }
  return true; //must return a boolean, true if it passes the filter.
}
