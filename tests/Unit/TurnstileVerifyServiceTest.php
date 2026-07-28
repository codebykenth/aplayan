<?php

use App\Services\TurnstileVerifyService;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;

beforeEach(function () {
    config(['services.turnstile.secret' => 'test-secret-key']);
});

it('returns true when Cloudflare returns success', function () {
    Http::preventStrayRequests();

    Http::fake([
        'challenges.cloudflare.com/turnstile/v0/siteverify' => Http::response([
            'success' => true,
        ]),
    ]);

    $service = new TurnstileVerifyService();

    expect($service->verify('test-turnstile-token'))->toBeTrue();
});

it('returns false when Cloudflare returns failure', function () {
    Http::preventStrayRequests();

    Http::fake([
        'challenges.cloudflare.com/turnstile/v0/siteverify' => Http::response([
            'success' => false,
            'error-codes' => ['invalid-input-secret'],
        ]),
    ]);

    $service = new TurnstileVerifyService();

    expect($service->verify('invalid-token'))->toBeFalse();
});

it('returns false when Cloudflare API returns an error', function () {
    Http::preventStrayRequests();

    Http::fake([
        'challenges.cloudflare.com/turnstile/v0/siteverify' => Http::response([], 500),
    ]);

    $service = new TurnstileVerifyService();

    expect($service->verify('test-token'))->toBeFalse();
});

it('sends the correct request to the Cloudflare verification endpoint', function () {
    Http::preventStrayRequests();

    Http::fake([
        'challenges.cloudflare.com/turnstile/v0/siteverify' => Http::response([
            'success' => true,
        ]),
    ]);

    $service = new TurnstileVerifyService();

    $service->verify('my-turnstile-token');

    Http::assertSent(function (\Illuminate\Http\Client\Request $request) {
        expect($request->url())->toBe('https://challenges.cloudflare.com/turnstile/v0/siteverify');
        expect($request->method())->toBe('POST');
        expect($request->body())->toContain('secret=test-secret-key');
        expect($request->body())->toContain('response=my-turnstile-token');

        return true;
    });
});