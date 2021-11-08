<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
?>
<html>

<head>
<title>audioBLAST! Recordings</title>
<link rel="stylesheet" href="https://cdn.audioblast.org/ab-api.css">
<link href="https://cdn.audioblast.org/tabulator/dist/css/tabulator.min.css" rel="stylesheet">
<script type="text/javascript" src="https://cdn.audioblast.org/tabulator/dist/js/tabulator.min.js"></script>
<script type="text/javascript" src="https://cdn.audioblast.org/ab-tabulator.js"></script>
</head>

<body>
<?php
if (isset($_GET["page"])) {
  $current = $_GET["page"];
} else {
  $current = "recordings";
}
?>

<h1><?php print($current); ?></h1>

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

</body>

<script>
generateTabulator("#data-table", "<?php print($current); ?>");
</script>
</html>
