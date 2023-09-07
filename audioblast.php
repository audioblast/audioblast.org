<?php 
/* 
audioBlast Search

This page is for the audioBlast search interface. It is a single page app that uses the audioBlast 
API to search for recordings, annotations and traits.
*/

// Initial configurtion and quick return if ping page
include("includes/init.php");
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <title>audioBlast!<?php print($in_dev?" (DEV)":"")?></title>
  <link rel="stylesheet" href="/ab-api.css">
  <link rel="stylesheet" href="https://view.audioblast.org/progress.css">
  <link rel="stylesheet" href="https://cdn.audioblast.org/tabulator/dist/css/tabulator.min.css">
  <script type="text/javascript" src="https://cdn.audioblast.org/tabulator/dist/js/tabulator.min.js"></script>
  <script type="text/javascript" src="/ab-tabulator.js"></script>
  <?php 
    //Load the search plugins
    include("includes/load_search_js.php"); 
  ?>
</head>

<body>
  <div id="title">
    <a href="/"><img src="https://cdn.audioblast.org/audioblast_flash.png" class="audioblast-flash" /></a>
    <h1>audioBlast<?php print($in_dev?" (DEV)":"")?></h1>
    <div id="menu">
      <details>
        <summary>Show search console</summary>
        <div id="consoleContainer"></div>
      </details>
    </div>
  </div>
  
  <div id="infoContainer" class="feature-container">
    <div id="pythia" class="feature">
      <h1 id="pythia-query"></h1>
      <details id="pythia-query-details">
        <summary>Show replacement patterns</summary>
        <div id="pythia-terms"></div>
      </details>
      <div id="pythia-terms"></div>
    </div>
  </div>
  <div id="contentContainer" class="feature-container"></div>

  <script>
    //Start the search once the page has loaded
    document.addEventListener("DOMContentLoaded", function(event) {
      searchAB.init();
    });
  </script>
</body>
</html>
