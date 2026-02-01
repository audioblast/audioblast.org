<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

$current = "about";
include("header.php");
?>
    <div id="menu">
      <p>Audioblast is a project to collect and analyse sound files and data from around the world to make a bioacoustic discovery and search engine.</p>
      <p>This website uses the <a href="https://api.audioblast.org">audioBLAST API</a> which you can use to create your own projects.</p>
    </div>
  </div>

  <div class="feature-container">
    <div class="feature">
      <h2>Development</h2>
      <h3>Automated Acoustic Observatories</h3>
      <h3>Urban Nature Project</h3>
      <h3>GitHub</h3>
    </div>

    <div class="feature">
      <h2>Infrastructure</h2>
    </div>

    <div class="feature">
      <h2>Data Contributors</h2>
    </div>

    <div class="feature">
      <h2>3rd Party Libraries</h2>
      <h3>Tabulator</h3>
      <h3>Plotly</h3>
      <h3>zcjs</h3>
      <h3>PhyMoji</h3>
    </div>

  </div>

<?php include("footer.php"); ?>
