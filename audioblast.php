<!DOCTYPE html>
<html lang="en">
<head>
  <title>audioBlast!</title>
  <link rel="stylesheet" href="/ab-api.css">
  <link rel="stylesheet" href="https://cdn.audioblast.org/tabulator/dist/css/tabulator.min.css">
  <script type="text/javascript" src="https://cdn.audioblast.org/tabulator/dist/js/tabulator.min.js"></script>
  <script type="text/javascript" src="/ab-tabulator.js"></script>
<?php include("includes/load_search_js.php"); ?>
</head>

<body>
  <div id="title">
    <a href="/"><img src="https://cdn.audioblast.org/audioblast_flash.png" class="audioblast-flash" /></a>
    <h1>audioBlast</h1>
    <div id="menu">
    </div>
    
  </div>
  <div id="search-results" class="feature-container">
  </div>
  <script>
    document.addEventListener("DOMContentLoaded", function(event) {
      searchAB.init();
    });
  </script>
</body>
</html>
