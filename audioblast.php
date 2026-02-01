<?php
$current = "search";
include("header.php");
?>
  <script>
    document.addEventListener("DOMContentLoaded", function(event) {
      searchAB.init();
    });
  </script>
  </div>

  <div id="search-results" class="feature-container">
  </div>

  <details id="search-console">
    <summary>Search console</summary>
    <div id="menu">
    </div>
  </details>
<?php include("footer.php"); ?>
