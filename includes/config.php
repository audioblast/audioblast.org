<?php
/**
 * audioBLAST Configuration
 * 
 * Centralized configuration for the audioBLAST website.
 */

// API and CDN URLs
define('API_BASE', 'https://api.audioblast.org');
define('CDN_BASE', 'https://cdn.audioblast.org');

// A page is one this site serves itself (home, about) or a data module of the API, which is the
// authority on which modules exist: a name matching none of them gives an error in place of its
// table. So this only has to keep the name safe to put in a URL and to print in the page.
define('PAGE_PATTERN', '/^[a-z][a-z0-9_]*$/');

// Tabulator CDN
define('TABULATOR_CSS', CDN_BASE . '/tabulator/dist/css/tabulator.min.css');
define('TABULATOR_JS', CDN_BASE . '/tabulator/dist/js/tabulator.min.js');
