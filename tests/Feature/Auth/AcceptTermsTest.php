<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('authenticated user can accept terms and conditions', function () {
    $user = User::factory()->create([
        'terms_accepted_at' => null,
    ]);

    expect($user->hasAcceptedTerms())->toBeFalse();

    $response = $this->actingAs($user)->post(route('terms.accept'));

    $response->assertRedirect();
    $user->refresh();

    expect($user->hasAcceptedTerms())->toBeTrue();
    expect($user->terms_accepted_at)->not->toBeNull();
});

test('unauthenticated user cannot accept terms', function () {
    $response = $this->post(route('terms.accept'));

    $response->assertRedirect(route('login'));
});

test('accepting terms is idempotent if already accepted', function () {
    $acceptedAt = now()->subDays(5);
    $user = User::factory()->create([
        'terms_accepted_at' => $acceptedAt,
    ]);

    $this->actingAs($user)->post(route('terms.accept'));

    $user->refresh();
    expect($user->terms_accepted_at->toDateTimeString())->toBe($acceptedAt->toDateTimeString());
});
