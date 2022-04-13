<html>
<head>
  <title>audioBlast!</title>
  <link rel="stylesheet" href="/ab-api.css">
  <link rel="stylesheet" href="https://cdn.audioblast.org/tabulator/dist/css/tabulator.min.css">
  <script type="text/javascript" src="https://cdn.audioblast.org/tabulator/dist/js/tabulator.min.js"></script>
  <script type="text/javascript" src="/ab-tabulator.js"></script>
</head>

<body>
  <div id="title">
    <a href="/"><img src="https://cdn.audioblast.org/audioblast_flash.png" class="audioblast-flash" /></a>
    <h1>𝛼-Blast! (very alpha version of audioBLAST!)</h1>
  <div id="menu">
    <p>Starting...</p>
    <?php
    $mode = "none";
    if (isset($_GET["source"]) && isset($_GET["id"])) {
      $mode = "recording";
      print("<p>Searching against recording ".$_GET["id"]." from ".$_GET["source"]."</p>");
    }
    if (isset($_GET["search"])) {
      $mode = "search";
      print("<p>Searching against keyword(s): ".$_GET["search"]);
    }
    ?>
  </div>
</div>

<?php
  if ($mode == "recording") {
    $source = $_GET["source"];
    $id = $_GET["id"];
    ?>
    <h2>Same species</h2>
    <div id="search-same-species" class="search-table"></div>

    <script>
    var filterAB = [];
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "https://api.audioblast.org/data/recordings/?output=nakedJSON&source=<?php print($source);?>&id=<?php print($id);?>", true);
    xhr.onload = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          filterAB = JSON.parse(this.responseText)[0];
          var tab1 = generateTabulator("#search-same-species", "recordings");
        } else {
          console.error(xhr.statusText);
        }
      }
    };
    xhr.onerror = function (e) {
      console.error(xhr.statusText);
    };
    xhr.send(null);
    <?php
  }
?>
</script>

</body>
</html>
