<?php

return [
    'enabled' => filter_var(env('AUTODEPLOY_ENABLED', false), FILTER_VALIDATE_BOOL),
    'token' => (string) env('AUTODEPLOY_TOKEN', ''),
];
