<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
?>

<html>

<head>
<title>audioBLAST! Recordings</title>
<link rel="stylesheet" href="ab-api.css">
<link rel="stylesheet" href="https://cdn.audioblast.org/tabulator/dist/css/tabulator.min.css">
<script type="text/javascript" src="https://cdn.audioblast.org/tabulator/dist/js/tabulator.min.js"></script>
<script type="text/javascript" src="ab-tabulator.js"></script>
</head>

<body>
<?php
if (isset($_GET["page"])) {
  $current = $_GET["page"];
} else {
  $current = "home";
}
?>

<div id="title">
  <a href="/"><img src="https://cdn.audioblast.org/audioblast_flash.png" class="audioblast-flash" /></a>
  <h1>audioBLAST! Browser</h1>
  <div id="menu">
  <?php
  if ($current == "home") {
    ?>
    <h2>Welcome to audioBLAST!</h2>
    <p>Audioblast is a project to collect and analyse sound files and data from around the world to make a bioacoustic discovery and search engine.</p>
    <p>This website uses the <a href="https://api.audioblast.org">audioBLAST API</a> which you can use to create your own projects.</p>
    <?php
  } else {
    print("<ul class='ulhoriz'>");
    $types = json_decode(
      file_get_contents("http://api.audioblast.org/standalone/modules/list_modules/?category=data&output=nakedJSON"));
    foreach ($types as $type) {
      print("<li><a href='https://audioblast.org/?page=".$type->name."'>".$type->hname."</a></li>");
    }
    print("</ul>");
  }
  ?>
  </div>
</div>

<?php
  if ($current == "home") {
    include("home.php");
  } else {
?>

<div id="data-table">
</div>
<?php
}
?>
</body>

<script>
generateTabulator("#data-table", "<?php print($current); ?>");
</script>
</html>
