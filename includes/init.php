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

// Initial configuration
$in_dev = FALSE;

// Validate and sanitize page parameter
$requested_page = isset($_GET["page"]) ? $_GET["page"] : "home";
$current_page = in_array($requested_page, ALLOWED_PAGES) ? $requested_page : "home";

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