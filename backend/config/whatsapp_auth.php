<?php

return [
    'realtime_url' => rtrim((string) env('REALTIME_INTERNAL_URL', 'http://realtime:4100'), '/'),
    'shared_secret' => (string) env('AGENT_SHARED_SECRET', ''),
    'ttl_minutes' => max(1, (int) env('WHATSAPP_OTP_TTL_MINUTES', 5)),
    'max_attempts' => max(1, (int) env('WHATSAPP_OTP_MAX_ATTEMPTS', 5)),
];
