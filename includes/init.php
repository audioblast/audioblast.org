<?php
/**
 * audioBLAST Initialization
 * 
 * Handles initial configuration and security checks.
 */

// Load configuration
require_once(__DIR__ . '/config.php');

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