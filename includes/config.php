<?php
/**
 * audioBLAST Configuration
 * 
 * Centralized configuration for the audioBLAST website.
 */

// API and CDN URLs
define('API_BASE', 'https://api.audioblast.org');
define('CDN_BASE', 'https://cdn.audioblast.org');

// Allowed pages whitelist
define('ALLOWED_PAGES', [
    'home',
    'recordings',
    'annomate',
    'traits',
    'about',
    'deployments',
    'recordingstaxa',
    'taxa',
    'traitstaxa'
]);

// Tabulator CDN
define('TABULATOR_CSS', CDN_BASE . '/tabulator/dist/css/tabulator.min.css');
define('TABULATOR_JS', CDN_BASE . '/tabulator/dist/js/tabulator.min.js');
