<?php

test('the sitemap.xml endpoint returns valid XML', function () {
    $response = $this->get('sitemap.xml');

    $response->assertOk();
    $response->assertHeaderContains('Content-Type', 'text/xml');

    $xml = simplexml_load_string($response->getContent());
    expect($xml)->not->toBeFalse();

    $namespaces = $xml->getNamespaces(true);
    expect($namespaces)->toHaveKey('');
    expect((string) $namespaces[''])->toBe('http://www.sitemaps.org/schemas/sitemap/0.9');
});

test('the sitemap.xml contains all public pages', function () {
    $response = $this->get('sitemap.xml');
    $xml = simplexml_load_string($response->getContent());

    $urls = [];
    foreach ($xml->url as $url) {
        $urls[] = (string) $url->loc;
    }

    expect($urls)->toContain(config('app.url').'/');
    expect($urls)->toContain(config('app.url').'/privacy-policy');
    expect($urls)->toContain(config('app.url').'/terms-of-service');
    expect($urls)->toContain(config('app.url').'/login');
    expect($urls)->toContain(config('app.url').'/register');
});

test('each sitemap url has required child elements', function () {
    $response = $this->get('sitemap.xml');
    $xml = simplexml_load_string($response->getContent());

    foreach ($xml->url as $url) {
        expect((string) $url->loc)->not->toBeEmpty();
        expect((string) $url->lastmod)->not->toBeEmpty();
        expect((string) $url->changefreq)->not->toBeEmpty();
        expect((string) $url->priority)->not->toBeEmpty();
    }
});

test('robots.txt allows public routes and disallows private routes', function () {
    $response = $this->get('robots.txt');

    $response->assertOk();
    $content = $response->getContent();

    expect($content)->toContain('User-agent: *');
    expect($content)->toContain('Allow: /');
    expect($content)->toContain('Allow: /privacy-policy');
    expect($content)->toContain('Allow: /terms-of-service');
    expect($content)->toContain('Allow: /login');
    expect($content)->toContain('Disallow: /dashboard');
    expect($content)->toContain('Disallow: /job-applications/');
    expect($content)->toContain('Disallow: /documents/');
    expect($content)->toContain('Disallow: /settings/');
    expect($content)->toContain('Disallow: /analytics/');
    expect($content)->toContain('Disallow: /goals/');
    expect($content)->toContain('Disallow: /calendar/');
});

test('robots.txt contains sitemap directive', function () {
    $response = $this->get('robots.txt');
    $content = $response->getContent();

    expect($content)->toContain('Sitemap:');
});
