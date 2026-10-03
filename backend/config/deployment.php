<?php

return [
    'enabled' => filter_var(env('DEPLOYMENT_ENABLED', false), FILTER_VALIDATE_BOOL),
    'script' => env('DEPLOYMENT_SCRIPT', ''),
    'php_binary' => env('DEPLOYMENT_PHP_BINARY', 'php'),
    'timeout' => (int) env('DEPLOYMENT_TIMEOUT', 1800),
    'use_sudo' => filter_var(env('DEPLOYMENT_USE_SUDO', false), FILTER_VALIDATE_BOOL),
    'sudo_command' => env('DEPLOYMENT_SUDO_COMMAND', '/usr/local/bin/gaspronal-deploy'),
];
