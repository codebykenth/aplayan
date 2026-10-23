<?php

/**
 * A Vercel function runs from a read-only filesystem; only /tmp is writable.
 * Laravel writes compiled views, sessions, cache data and logs under storage/,
 * so the entry point must redirect those paths before the framework boots.
 * Otherwise the Blade compiler throws "Please provide a valid cache path."
 * and logging fails with "Read-only file system".
 */
test('the vercel entry point redirects laravel writable paths to /tmp', function () {
    $entrypoint = file_get_contents(base_path('api/index.php'));

    expect($entrypoint)
        ->toContain('useStoragePath')
        ->toContain("'/tmp/storage'")
        ->toContain("'/framework/views'")
        ->toContain("'VIEW_COMPILED_PATH'")
        ->toContain("'APP_PACKAGES_CACHE'")
        ->toContain("'APP_SERVICES_CACHE'");
});

test('the vercel entry point creates the writable storage directories', function () {
    $entrypoint = file_get_contents(base_path('api/index.php'));

    expect($entrypoint)->toContain('mkdir($storagePath.$directory, 0777, true)');
});
