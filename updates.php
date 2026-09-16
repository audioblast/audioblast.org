<?php include("includes/init.php"); ?>
<html>

<head>
  <title>audioBlast Updates</title>
  <?php echo versioned_stylesheets('ab-api.css'); ?>
</head>

<body>
  <div id="title">
    <a href="/"><img src="<?php echo CDN_BASE; ?>/audioblast_flash.png" alt="audioBlast flash logo" class="audioblast-flash" /></a>
    <h1>audioBLAST Updates</h1>
    <div id="menu">
      <?php include("includes/welcome.php"); ?>
    </div>
  </div>

  <div class="feature-container">
    <div class="feature">
      <h3>Week of 26th January 2026</h3>
      <ul>
        <li>Modernised UI for audioblast.org</li>
      </ul>
      <h3>Week of 8th January 2024</h3>
      <ul>
        <li>taxonBot now adds missing taxonomic ranks from the Catalogue of Life.</li>
      </ul>

      <h3>Week of 17th December 2023</h3>
      <ul>
      <li>BirdNET analyses are now linked to deployments.</li>
      </ul>
      
      <h3>Week of 10th December 2023</h3>
      <ul>
        <li>Soundscape recordings can now be associated with a deployment.</li>
        <li>Soundscapes view shows data from deployments.</li>
        <li>First data from BirdNET is now in the system.</li>
        <li>There is now an updates page.</li>
        <li>Infrastrcture: Milvus database for testing vector search.</li>
        <li>Progressive uploads for deployments.</li>
        <li>Progressive uploads for annotations.</li>
      </ul>
    </div>

    </div>
  </div>
</html>
