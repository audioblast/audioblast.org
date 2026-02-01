<?php
/**
 * audioBLAST Shared Header
 * 
 * Common HTML head and title bar used across pages.
 * 
 * Variables expected:
 * - $page_title (optional): Custom page title
 * - $in_dev: Whether in development mode
 * - $include_tabulator: Whether to include Tabulator CSS/JS
 * - $include_search: Whether to include search JS
 */

$page_title = isset($page_title) ? $page_title : "audioBLAST";
$include_tabulator = isset($include_tabulator) ? $include_tabulator : true;
$include_search = isset($include_search) ? $include_search : false;
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="audioBLAST! - A bioacoustic discovery and search engine">
  <title><?php echo htmlspecialchars($page_title) . ($in_dev ? " (DEV)" : ""); ?></title>
  
  <link rel="stylesheet" href="/ab-api.css">
  <?php if ($include_tabulator): ?>
  <link rel="stylesheet" href="<?php echo TABULATOR_CSS; ?>">
  <script src="<?php echo TABULATOR_JS; ?>"></script>
  <script src="/ab-tabulator.js"></script>
  <?php endif; ?>
  <?php if ($include_search): ?>
  <link rel="stylesheet" href="https://view.audioblast.org/progress.css">
  <?php include(__DIR__ . '/load_search_js.php'); ?>
  <?php endif; ?>
</head>

<body>
<div id="title" role="banner">
  <a href="/">
    <img src="<?php echo CDN_BASE; ?>/audioblast_flash.png"
         alt="audioBLAST flash logo"
         class="audioblast-flash" />
  </a>
  <h1>audioBLAST<?php echo $in_dev ? " (DEV)" : ""; ?></h1>
