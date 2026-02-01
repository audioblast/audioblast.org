<?php
$current = "search";
include("header.php");
?>
  <script>
    document.addEventListener("DOMContentLoaded", function(event) {
      searchAB.init();
    });
  </script>
    <h1>𝛼-Blast! (very alpha version of audioBLAST!)</h1>

    <details id="search-console">
      <summary>Search console</summary>
      <div id="menu">
      </div>
    </details>
  </div>
  <div id="search-results" class="feature-container">
  </div>
<?php include("footer.php"); ?>
