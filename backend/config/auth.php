<?php

use App\Models\User;

return [
    'defaults' => [
        'guard' => 'api',
        'passwords' => 'users',
    ],
    'guards' => [
        'web' => ['driver' => 'session', 'provider' => 'users'],
        'api' => ['driver' => 'jwt', 'provider' => 'users'],
    ],
    'providers' => [
        'users' => ['driver' => 'eloquent', 'model' => User::class],
    ],
    'passwords' => [
        'users' => [
            'provider' => 'users',
            'table' => env('AUTH_PASSWORD_RESET_TOKEN_TABLE', 'password_reset_tokens'),
            'expire' => 60,
            'throttle' => 60,
        ],
    ],
    'password_timeout' => env('AUTH_PASSWORD_TIMEOUT', 10800),

    /*
    |--------------------------------------------------------------------------
    | Temporary direct recovery bypass
    |--------------------------------------------------------------------------
    |
    | SECURITY TODO: remove this temporary mechanism as soon as the password
    | recovery incident is closed. Never commit the temporary password.
    |
    */
    'temporary_direct_recovery' => [
        'enabled' => (bool) env('AUTH_TEMP_DIRECT_RECOVERY_ENABLED', false),
        'email' => env('AUTH_TEMP_DIRECT_RECOVERY_EMAIL'),
        'password' => env('AUTH_TEMP_DIRECT_RECOVERY_PASSWORD'),
    ],
];
