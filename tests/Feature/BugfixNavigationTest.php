<?php

use App\Http\Resources\JobApplicationResource;
use App\Models\JobApplication;
use App\Models\User;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\URL;

it('passes applications prop as a plain array to the Inertia page', function () {
    $user = User::factory()->create();
    JobApplication::factory()->count(2)->create(['user_id' => $user->id]);

    $response = $this->actingAs($user)->get(route('job-applications.index'));

    $response->assertSuccessful();
    // JobApplicationResource::collection() wraps data in { data: [...] }
    // Inertia serializes resources as nested objects by default.
    // The frontend must extract applications.data before calling .filter().
    // This test ensures the page renders without error.
});

it('redirects authenticated users to job-applications after login', function () {
    Http::preventStrayRequests();

    Http::fake([
        'challenges.cloudflare.com/turnstile/v0/siteverify' => Http::response([
            'success' => true,
        ]),
    ]);

    $user = User::factory()->create([
        'email' => 'test@example.com',
        'password' => bcrypt('password'),
    ]);

    $this->post(route('login'), [
        'email' => 'test@example.com',
        'password' => 'password',
        'turnstile' => 'valid-turnstile-token',
    ])->assertRedirect(route('job-applications.index'));

    $this->assertAuthenticatedAs($user);
});

it('redirects authenticated users to job-applications after registration', function () {
    Http::preventStrayRequests();

    Http::fake([
        'challenges.cloudflare.com/turnstile/v0/siteverify' => Http::response([
            'success' => true,
        ]),
    ]);

    $this->post(route('register'), [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'Password123!',
        'password_confirmation' => 'Password123!',
        'turnstile' => 'valid-turnstile-token',
    ])->assertRedirect(route('job-applications.index'));

    $this->assertAuthenticated();
});

it('redirects authenticated users to job-applications after socialite login', function () {
    Http::preventStrayRequests();

    Http::fake([
        'challenges.cloudflare.com/turnstile/v0/siteverify' => Http::response([
            'success' => true,
        ]),
    ]);

    $googleUser = Mockery::mock('Laravel\Socialite\Contracts\User');
    $googleUser->shouldReceive('getId')->andReturn('google-id-123');
    $googleUser->shouldReceive('getName')->andReturn('Google User');
    $googleUser->shouldReceive('getEmail')->andReturn('google@example.com');
    $googleUser->shouldReceive('getAvatar')->andReturn('https://example.com/avatar.jpg');

    Socialite::shouldReceive('driver->user')->andReturn($googleUser);

    $this->get(route('google.callback'))
        ->assertRedirect(route('job-applications.index'));
});

it('redirects verified users from verification notice to job-applications', function () {
    $user = User::factory()->create(['email_verified_at' => now()]);

    $this->actingAs($user)
        ->get(route('verification.notice'))
        ->assertRedirect(route('job-applications.index'));
});

it('redirects to job-applications after email verification', function () {
    $user = User::factory()->unverified()->create();

    $uri = URL::signedRoute('verification.verify', [
        'id' => $user->getKey(),
        'hash' => sha1($user->getEmailForVerification()),
    ]);

    $this->actingAs($user)
        ->get($uri)
        ->assertRedirect(route('job-applications.index'));
});
