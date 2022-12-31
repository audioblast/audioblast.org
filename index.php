<?php
//Initial configurtion
$in_dev = FALSE;
$current_page = isset($_GET["page"]) ? $_GET["page"] : "home";

// If running in dev environment show errors
if ($_SERVER['SERVER_NAME'] == 'ab.acousti.cloud') {
  ini_set('display_errors', 1);
  ini_set('display_startup_errors', 1);
  error_reporting(E_ALL);

  $in_dev = TRUE;
}
?>
<!DOCTYPE html>
<html lang="en">

<head>
  <title><?php print("audioBLAST! ".$current_page.($in_dev?" (DEV)":"")); ?></title>

  <link rel="stylesheet" href="ab-api.css">
  <link rel="stylesheet" href="https://cdn.audioblast.org/tabulator/dist/css/tabulator.min.css">

  <script src="https://cdn.audioblast.org/tabulator/dist/js/tabulator.min.js"></script>
  <script src="ab-tabulator.js"></script>
  <script src="ab-search.js"></script>
</head>

<body>
<div id="title">
  <a href="/">
    <img src="https://cdn.audioblast.org/audioblast_flash.png"
    alt="audioBLAST flash logo"
    class="audioblast-flash" /></a>
  <h1>audioBLAST! Browser<?php print($in_dev?" (DEV)":"")?></h1>
  <div id="menu">
  <?php
  if ($current_page == "home") {
    ?>
    <h2>Welcome to audioBLAST!</h2>
    <p>AudioBlast is a project to collect and analyse sound files and data from around the world to make a bioacoustic discovery and search engine.</p>
    <p>This website uses the <a href="https://api.audioblast.org">audioBlast API</a> which you can use to create your own projects.</p>
    <?php
    include("home.php");
  } else {
    print("<ul class='ulhoriz'>");
    $types = json_decode(
      file_get_contents("http://api.audioblast.org/standalone/modules/list_modules/?category=data&output=nakedJSON"));
    foreach ($types as $type) {
      print("<li><a href='https://audioblast.org/?page=".$type->name."'>".$type->hname."</a></li>");
    }
    ?>
    </ul>
    <div id="data-table">
    </div>
    <script>
      generateTabulator("#data-table", "<?php print($current_page); ?>");
    </script>
    <?php
  }
  ?>
  </div>
</div>

</body>
</html>
