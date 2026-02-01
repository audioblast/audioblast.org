<?php include("includes/init.php"); ?>
<!DOCTYPE html>
<html lang="en">

<head>
  <title><?php print("audioBlast: ".$current_page.($in_dev?" (DEV)":"")); ?></title>
  <link rel="stylesheet" href="ab-api.css">
  <link rel="stylesheet" href="https://cdn.audioblast.org/tabulator/dist/css/tabulator.min.css">
  <script src="https://cdn.audioblast.org/tabulator/dist/js/tabulator.min.js"></script>
  <script src="ab-tabulator.js"></script>
</head>

<body<?php if ($current_page != "home") echo ' class="data-page"'; ?>>
<div id="title" role="banner">
  <a href="/">
    <img src="https://cdn.audioblast.org/audioblast_flash.png"
    alt="audioBlast flash logo"
    class="audioblast-flash" /></a>
  <h1>audioBlast Browser<?php print($in_dev?" (DEV)":"")?></h1>
  <div id="menu">
  <?php
  if ($current_page == "home") {
    include("includes/welcome.php");
    ?>
    </div></div>
    <?php
    include("includes/home.php");
  } else {
    ?>
    <ul class='ulhoriz' role='navigation' id='nav-menu'></ul>
    <script>
      fetch("https://api.audioblast.org/standalone/modules/list_modules/?category=data&output=nakedJSON")
        .then(response => response.json())
        .then(types => {
          const menu = document.getElementById('nav-menu');
          types.forEach(type => {
            menu.innerHTML += "<li><a href='/?page=" + type.name + "'>" + type.hname + "</a></li>";
          });
        });
    </script>
    </div></div>
    <div id="data-table" role="main"></div>
    <script>
      generateTabulator("#data-table", "<?php print($current_page); ?>");
    </script>
    <?php
  }
?>
</body>

</html>
