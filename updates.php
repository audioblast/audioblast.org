<?php include("includes/init.php"); ?>
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>audioBlast Updates<?php print($in_dev?" (DEV)":""); ?></title>
  <?php echo versioned_stylesheets('ab-api.css'); ?>
</head>

<body>
  <div id="title" role="banner">
    <a href="/"><img src="<?php echo CDN_BASE; ?>/audioblast_flash.png" alt="audioBlast flash logo" class="audioblast-flash" /></a>
    <h1>audioBLAST Updates<?php print($in_dev?" (DEV)":""); ?></h1>
    <div id="menu">
      <?php include("includes/welcome.php"); ?>
    </div>
  </div>

  <div class="feature-container" role="main">
    <div class="feature">
      <h3>Week of 21st September 2026</h3>
      <ul>
        <li>Every kind of data the API holds now has a page: descriptions, details, ecological
            interactions, images, links, locations, onomatopoeia, references, specimens and
            vernacular names have joined the browser.</li>
        <li>Table filters suggest the values a field holds as you type them.</li>
        <li>Recordings can be played from the table they are listed in.</li>
        <li>Searches for a taxon held by more than one source show its recordings, traits and
            annotations again.</li>
        <li>The browser and search pages lay themselves out for a phone.</li>
      </ul>
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
        <li>Infrastructure: Milvus database for testing vector search.</li>
        <li>Progressive uploads for deployments.</li>
        <li>Progressive uploads for annotations.</li>
      </ul>
    </div>
  </div>
</body>

</html>
