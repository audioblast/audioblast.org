<?php
// Whitelist of allowed pages
$allowed_pages = ['home', 'recordings', 'annomate', 'traits', 'about'];

if (isset($_GET["page"])) {
  $current = in_array($_GET["page"], $allowed_pages) ? $_GET["page"] : "home";
} else {
  $current = "home";
}
?>
<!DOCTYPE html>
<html lang="en">

<head>
  <title><?php print("audioBLAST! " . htmlspecialchars($current)); ?></title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="audioBLAST! - A bioacoustic discovery and search engine">
  
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">

  <link rel="stylesheet" href="/ab-api.css">
  <link rel="stylesheet" href="https://cdn.audioblast.org/tabulator/dist/css/tabulator.min.css">

  <script src="https://cdn.audioblast.org/tabulator/dist/js/tabulator.min.js"></script>
  <script src="/ab-tabulator.js"></script>
  <script src="/ab-search.js"></script>
</head>

<body>
<div id="title">
  <a href="/">
    <img src="https://cdn.audioblast.org/audioblast_flash.png"
    alt="audioBLAST flash logo"
    class="audioblast-flash" /></a>
  <h1>audioBLAST! Browser</h1>
