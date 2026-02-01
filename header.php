<?php
// Whitelist of allowed pages - includes all data modules from API
$allowed_pages = ['home', 'recordings', 'annomate', 'traits', 'about', 'deployments', 'recordingstaxa', 'taxa', 'traitstaxa'];

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
