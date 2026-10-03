<?php

return [
    'enabled' => filter_var(env('DEPLOYMENT_ENABLED', false), FILTER_VALIDATE_BOOL),
    'script' => env('DEPLOYMENT_SCRIPT', ''),
    'php_binary' => env('DEPLOYMENT_PHP_BINARY', 'php8.2'),
    'timeout' => (int) env('DEPLOYMENT_TIMEOUT', 900),
];
