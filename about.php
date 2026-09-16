<?php include("includes/init.php"); ?>
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>About audioBlast<?php print($in_dev?" (DEV)":""); ?></title>
  <?php echo versioned_stylesheets('ab-api.css'); ?>
</head>

<body>
  <div id="title" role="banner">
    <a href="/"><img src="<?php echo CDN_BASE; ?>/audioblast_flash.png" alt="audioBlast flash logo" class="audioblast-flash" /></a>
    <h1>About audioBLAST!<?php print($in_dev?" (DEV)":""); ?></h1>
    <div id="menu">
      <?php include("includes/welcome.php"); ?>
    </div>
  </div>

  <div class="feature-container" role="main">
    <div class="feature">
      <h2>Development</h2>
      <h3>Automated Acoustic Observatories</h3>
      <p>The audioBlast infrastructure was originally implemented by <a href="https://ebaker.me.uk">Ed Baker</a> to internally support the Leverhulme Trust funded <a href="https://ebaker.me.uk/aao">Automated Acoustic Observatories</a> project at the University of York.</p>
      <h3>Urban Nature Project</h3>
      <p>Part of the current development cycle is supported by the <i>Urban Nature Project</i> at the
         Natural History Museum, London.</p>
      <h3>GitHub</h3>
      <p>You can contribute to the project at the <a href="https://github.com/audioblast">audioBlast
        GitHub</a>.</p>
    </div>

    <div class="feature">
      <h2>Infrastructure</h2>
      <p>Computing infrastructure is currently provided by the Natural History Museum, London.</p>
    </div>

    <div class="feature">
      <h2>Data Contributors</h2>
      <ul id="data-contributors"></ul>
    </div>

    <div class="feature">
      <h2>3rd Party Libraries</h2>
      <h3><a href="https://tabulator.info/">Tabulator</a></h3>
      <p>Interactive tables on the web.</p>
      <h3><a href="https://plotly.com/">Plotly</a></h3>
      <p>Interactive charts.</p>
      <h3><a href="https://github.com/BioAcoustica/zcjs">zcjs</a></h3>
      <p>Displays zero-crossing audio files.</p>
      <h3><a href="https://github.com/edwbaker/PhyMoji-PHP">PhyMoji</a></h3>
      <p>Phylogenetic emoji search.</p>
    </div>
  </div>

  <script>
    fetch(<?php echo json_encode(API_BASE); ?> + "/standalone/modules/list_modules/?category=source&output=nakedJSON")
      .then(response => {
        if (!response.ok) throw new Error("HTTP " + response.status);
        return response.json();
      })
      .then(sources => {
        if (!Array.isArray(sources)) throw new Error("Unexpected source list response");
        const list = document.getElementById("data-contributors");
        sources.forEach(source => {
          const item = document.createElement("li");
          item.textContent = source.hname;
          list.appendChild(item);
        });
      })
      .catch(err => console.error("Failed to load data contributors:", err));
  </script>
</body>

</html>
