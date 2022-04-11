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

<a href="index.php"><img src="https://cdn.audioblast.org/audioblast_logo.png" /></a>
<h1><?php print($current); ?></h1>

<?php
  if ($current == "home") {
    include("home.php");
  } else {
?>
<ul class='ulhoriz'>
<?php
$types = json_decode(file_get_contents("http://api.audioblast.org/standalone/modules/list_modules/?category=data&output=nakedJSON"));
foreach ($types as $type) {
  print("<li><a href='https://audioblast.org/?page=".$type->name."'>".$type->hname."</a></li>");
}
?>
</ul>

<div id="module-info">
<?php
  $minfo = json_decode(file_get_contents("http://api.audioblast.org/standalone/modules/module_info/?output=nakedJSON&module=".$current));
  print($minfo->desc);
?>
</div>

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
