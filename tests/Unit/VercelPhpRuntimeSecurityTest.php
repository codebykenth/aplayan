<?php

/**
 * Guards the Vercel deployment against PHP2Shell
 * (CVE-2026-109618 / CVE-2026-109619).
 *
 * vercel-php@0.8.0 bundles PHP 8.4.14 from the amazon-linux-2023-v84 package,
 * which has no patched build. vercel-php@0.9.0 resolves almalinux-9-v85
 * to PHP 8.5.12, the fixed release.
 */
test('the vercel runtime uses a php build patched for php2shell', function () {
    $config = json_decode(file_get_contents(base_path('vercel.json')), true);

    expect($config['functions']['api/index.php']['runtime'])->toBe('vercel-php@0.9.0');
});

test('the vercel php configuration keeps php2shell hardening in place', function () {
    $ini = parse_ini_file(base_path('api/php.ini'), false, INI_SCANNER_RAW);

    expect($ini)
        ->toMatchArray([
            'session.upload_progress.enabled' => 'Off',
            'fatal_error_backtraces' => 'Off',
            'expose_php' => 'Off',
            'display_errors' => 'Off',
            'allow_url_include' => 'Off',
            'enable_dl' => 'Off',
        ]);
});
