<?php
//Initial configurtion
$in_dev = FALSE;
$current_page = isset($_GET["page"]) ? $_GET["page"] : "home";

// If ping page, return pong. This is used by status.acousti.cloud to check that
// the server is up and returning HTML.
if ($current_page == "ping") {
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