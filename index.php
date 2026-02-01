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
    print("<ul class='ulhoriz' role='navigation'>");
    $types_json = @file_get_contents(API_BASE . "/standalone/modules/list_modules/?category=data&output=nakedJSON");
    if ($types_json !== false) {
      $types = json_decode($types_json);
      if ($types) {
        foreach ($types as $type) {
          print("<li><a href='/?page=".$type->name."'>".$type->hname."</a></li>");
        }
      }
    }
    ?>
    </ul>
    <div id="data-table" role="main">
    </div>
    <script>
      generateTabulator("#data-table", "<?php print($current_page); ?>");
    </script>
    </div></div>
    <?php
  }
?>
</body>

</html>
