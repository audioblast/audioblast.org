<html>
<head>
  <title>audioBlast! Search</title>
  <link rel="stylesheet" href="https://audioblast.org/ab-api.css">
  <link rel="stylesheet" href="https://cdn.audioblast.org/tabulator/dist/css/tabulator.min.css">
  <script type="text/javascript" src="https://cdn.audioblast.org/tabulator/dist/js/tabulator.min.js"></script>
  <script type="text/javascript" src="https://audioblast.org/ab-tabulator.js"></script>
</head>

<body>
  <h1>audioBlast! Search (VERY VERY ALPHA)</h1>
  <?php
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
  </script>

</body>
</html>
