<?php

test('falls back to a writable default log channel when no log channel is configured', function () {
    // Serverless runtimes such as Vercel expose a read-only filesystem, so the
    // default log channel must never fall back to a file-based channel that
    // requires creating a directory under storage/.
    unset($_ENV['LOG_CHANNEL'], $_SERVER['LOG_CHANNEL']);
    putenv('LOG_CHANNEL');

    $logging = require base_path('config/logging.php');

    expect($logging['default'])->toBe('stderr');
});
