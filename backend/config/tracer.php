<?php

return [
    'enabled' => env('TRACER_ENABLED', false),
    'python_enabled' => env('TRACER_PYTHON_ENABLED', false),
    'java_enabled' => env('TRACER_JAVA_ENABLED', false),
    'service_url' => env('TRACER_SERVICE_URL', 'http://127.0.0.1:4100'),
    'timeout_seconds' => (int) env('TRACER_TIMEOUT_SECONDS', 5),
];
