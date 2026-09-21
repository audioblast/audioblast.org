<?php
/**
 * audioBLAST Initialization
 * 
 * Handles initial configuration and security checks.
 */

// Load configuration
require_once(__DIR__ . '/config.php');

/**
 * URL for a local static file with its modification time as a version, so
 * browsers fetch a new copy after each deploy instead of reusing a cached one.
 */
function versioned_asset($path) {
  $path = ltrim($path, '/');
  $file = __DIR__ . '/../' . $path;
  $version = file_exists($file) ? filemtime($file) : 0;
  return '/' . $path . '?v=' . $version;
}

/**
 * Links to the stylesheets a stylesheet @imports, in the same order and versioned
 * as above, since an imported file's URL can't carry a version. Import paths are
 * relative to the site root, where ab-api.css is. A stylesheet without @imports is
 * linked itself.
 */
function versioned_stylesheets($path) {
  $file = __DIR__ . '/../' . ltrim($path, '/');
  $css = file_exists($file) ? file_get_contents($file) : '';
  // Leave out any @import that is commented out
  $css = preg_replace('#/\*.*?\*/#s', '', $css);
  preg_match_all('/@import\s+url\(\s*[\'"]?([^\'")]+)/', $css, $matches);
  $imports = (count($matches[1]) > 0) ? $matches[1] : array($path);
  $links = array();
  foreach ($imports as $import) {
    // A stylesheet from another site is linked as it is
    $href = preg_match('#^([a-z]+:)?//#i', $import) ? htmlspecialchars($import) : versioned_asset($import);
    $links[] = '<link rel="stylesheet" href="' . $href . '">';
  }
  return implode("\n  ", $links) . "\n";
}

// Initial configuration
$in_dev = FALSE;

// Validate and sanitize page parameter
$requested_page = isset($_GET["page"]) ? $_GET["page"] : "home";
$current_page = preg_match(PAGE_PATTERN, $requested_page) ? $requested_page : "home";

// If ping page, return pong. This is used by status.acousti.cloud to check that
// the server is up and returning HTML.
if ($requested_page == "ping") {
  echo "pong";
  exit;
}

// If running in dev environment show errors
if ($_SERVER['SERVER_NAME'] == 'ab.acousti.cloud') {
  ini_set('display_errors', 1);
  ini_set('display_startup_errors', 1);
  error_reporting(E_ALL);
  
  $in_dev = TRUE;
}