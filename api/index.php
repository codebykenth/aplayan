<?php

use Illuminate\Contracts\Http\Kernel;
use Illuminate\Http\Request;

// require __DIR__."/../public/index.php";

// Load the Laravel application
require __DIR__.'/../vendor/autoload.php';
$app = require_once __DIR__.'/../bootstrap/app.php';

/*
|--------------------------------------------------------------------------
| Serverless writable paths
|--------------------------------------------------------------------------
|
| A Vercel function runs from a read-only filesystem; only /tmp is writable.
| Laravel writes compiled views, sessions, cache data and logs under storage/,
| so the paths below must be redirected before the framework boots. Without
| this the Blade compiler throws "Please provide a valid cache path." and
| logging fails with "Read-only file system".
|
*/

$storagePath = '/tmp/storage';

$app->useStoragePath($storagePath);

$writableDirectories = [
    '',
    '/app/private',
    '/app/public',
    '/framework/cache/data',
    '/framework/sessions',
    '/framework/views',
    '/logs',
];

foreach ($writableDirectories as $directory) {
    if (! is_dir($storagePath.$directory)) {
        mkdir($storagePath.$directory, 0777, true);
    }
}

// bootstrap/cache is read-only as well, so keep the framework manifests in /tmp.
$temporaryPaths = [
    'APP_CONFIG_CACHE' => '/tmp/config.php',
    'APP_EVENTS_CACHE' => '/tmp/events.php',
    'APP_PACKAGES_CACHE' => '/tmp/packages.php',
    'APP_ROUTES_CACHE' => '/tmp/routes.php',
    'APP_SERVICES_CACHE' => '/tmp/services.php',
    'VIEW_COMPILED_PATH' => $storagePath.'/framework/views',
];

foreach ($temporaryPaths as $key => $value) {
    putenv("{$key}={$value}");
    $_ENV[$key] = $value;
    $_SERVER[$key] = $value;
}

// Run the application
$kernel = $app->make(Kernel::class);
$response = $kernel->handle(
    $request = Request::capture()
);
$response->send();
$kernel->terminate($request, $response);
