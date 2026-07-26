<?php

use App\Models\User;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Auth\Events\Registered;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Notification;
use Laravel\Socialite\Facades\Socialite;

uses(RefreshDatabase::class);

// Registration
it('shows the registration page', function () {
    $this->get(route('register'))->assertInertia(fn ($page) => $page->component('auth/register'));
});

it('registers a new user and dispatches Registered event', function () {
    Event::fake();

    $this->post(route('register'), [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'Password123!',
        'password_confirmation' => 'Password123!',
    ])->assertRedirect(route('job-applications.index', absolute: false));

    $this->assertDatabaseHas('users', [
        'email' => 'test@example.com',
        'name' => 'Test User',
    ]);

    Event::assertDispatched(Registered::class);
});

it('requires password confirmation on registration', function () {
    $this->post(route('register'), [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'Password123!',
        'password_confirmation' => 'DifferentPassword123!',
    ])->assertSessionHasErrors('password');
});

it('requires a unique email on registration', function () {
    User::factory()->create(['email' => 'test@example.com']);

    $this->post(route('register'), [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'Password123!',
        'password_confirmation' => 'Password123!',
    ])->assertSessionHasErrors('email');
});

it('sends email verification notification after registration', function () {
    Notification::fake();

    $this->post(route('register'), [
        'name' => 'Test User',
        'email' => 'test@example.com',
        'password' => 'Password123!',
        'password_confirmation' => 'Password123!',
    ]);

    $user = User::where('email', 'test@example.com')->first();

    Notification::assertSentTo($user, VerifyEmail::class);
});

// Login / Logout
it('shows the login page', function () {
    $this->get(route('login'))->assertInertia(fn ($page) => $page->component('auth/login'));
});

it('authenticates a user with valid credentials', function () {
    $user = User::factory()->create([
        'email' => 'test@example.com',
        'password' => bcrypt('password'),
    ]);

    $this->post(route('login'), [
        'email' => 'test@example.com',
        'password' => 'password',
    ])->assertRedirect(route('job-applications.index', absolute: false));

    $this->assertAuthenticatedAs($user);
});

it('does not authenticate with invalid password', function () {
    User::factory()->create([
        'email' => 'test@example.com',
        'password' => bcrypt('password'),
    ]);

    $this->post(route('login'), [
        'email' => 'test@example.com',
        'password' => 'wrong-password',
    ])->assertSessionHasErrors('email');

    $this->assertGuest();
});

it('logs out an authenticated user', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->post(route('logout'))
        ->assertRedirect('/');

    $this->assertGuest();
});

// Guest middleware
it('redirects authenticated users away from guest pages', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('login'))
        ->assertRedirect(route('job-applications.index', absolute: false));
});

// Auth middleware
it('requires authentication for logout', function () {
    $this->post(route('logout'))->assertRedirect(route('login'));
});

// Google Socialite
it('redirects to Google for authentication', function () {
    $this->get(route('google.redirect'))
        ->assertRedirect();
});

it('handles Google callback for a new user', function () {
    $googleUser = Mockery::mock('Laravel\Socialite\Contracts\User');
    $googleUser->shouldReceive('getId')->andReturn('google-id-123');
    $googleUser->shouldReceive('getName')->andReturn('Google User');
    $googleUser->shouldReceive('getEmail')->andReturn('google@example.com');
    $googleUser->shouldReceive('getAvatar')->andReturn('https://example.com/avatar.jpg');

    Socialite::shouldReceive('driver->user')->andReturn($googleUser);

    $this->get(route('google.callback'))
        ->assertRedirect(route('job-applications.index', absolute: false));

    $this->assertDatabaseHas('users', [
        'email' => 'google@example.com',
        'name' => 'Google User',
        'google_id' => 'google-id-123',
        'avatar' => 'https://example.com/avatar.jpg',
    ]);

    $this->assertAuthenticated();
});

it('links Google account to existing user by email', function () {
    $user = User::factory()->create([
        'email' => 'existing@example.com',
        'google_id' => null,
        'avatar' => null,
    ]);

    $googleUser = Mockery::mock('Laravel\Socialite\Contracts\User');
    $googleUser->shouldReceive('getId')->andReturn('google-id-456');
    $googleUser->shouldReceive('getName')->andReturn('Existing User');
    $googleUser->shouldReceive('getEmail')->andReturn('existing@example.com');
    $googleUser->shouldReceive('getAvatar')->andReturn('https://example.com/avatar2.jpg');

    Socialite::shouldReceive('driver->user')->andReturn($googleUser);

    $this->get(route('google.callback'))
        ->assertRedirect(route('job-applications.index', absolute: false));

    $this->assertDatabaseHas('users', [
        'id' => $user->id,
        'email' => 'existing@example.com',
        'google_id' => 'google-id-456',
        'avatar' => 'https://example.com/avatar2.jpg',
    ]);

    $this->assertAuthenticatedAs($user);
});

// Forgot Password
it('shows the forgot password page', function () {
    $this->get(route('password.request'))
        ->assertInertia(fn ($page) => $page->component('auth/forgot-password'));
});

it('sends a password reset link', function () {
    Notification::fake();

    $user = User::factory()->create(['email' => 'test@example.com']);

    $this->post(route('password.email'), [
        'email' => 'test@example.com',
    ])->assertSessionHas('status');

    Notification::assertSentTo($user, ResetPassword::class);
});

it('shows error for unknown email on password reset', function () {
    $this->post(route('password.email'), [
        'email' => 'unknown@example.com',
    ])->assertSessionHasErrors('email');
});

it('shows the password reset page with token', function () {
    $user = User::factory()->create(['email' => 'test@example.com']);

    $token = Password::createToken($user);

    $this->get(route('password.reset', ['token' => $token, 'email' => 'test@example.com']))
        ->assertInertia(fn ($page) => $page
            ->component('auth/reset-password')
            ->where('token', $token)
            ->where('email', 'test@example.com')
        );
});

it('resets the password with a valid token', function () {
    Event::fake();

    $user = User::factory()->create([
        'email' => 'test@example.com',
        'password' => bcrypt('old-password'),
    ]);

    $token = Password::createToken($user);

    $this->post(route('password.update'), [
        'token' => $token,
        'email' => 'test@example.com',
        'password' => 'NewPassword123!',
        'password_confirmation' => 'NewPassword123!',
    ])->assertRedirect(route('login'));

    $this->assertCredentials([
        'email' => 'test@example.com',
        'password' => 'NewPassword123!',
    ]);

    Event::assertDispatched(PasswordReset::class);
});

it('shows error for invalid token on password reset', function () {
    $this->post(route('password.update'), [
        'token' => 'invalid-token',
        'email' => 'test@example.com',
        'password' => 'NewPassword123!',
        'password_confirmation' => 'NewPassword123!',
    ])->assertSessionHasErrors('email');
});

// Email Verification
it('shows the email verification notice page', function () {
    $user = User::factory()->unverified()->create();

    $this->actingAs($user)
        ->get(route('verification.notice'))
        ->assertInertia(fn ($page) => $page->component('auth/verify-email'));
});

it('redirects verified users from verification notice', function () {
    $user = User::factory()->create(['email_verified_at' => now()]);

    $this->actingAs($user)
        ->get(route('verification.notice'))
        ->assertRedirect();
});

it('resends the verification email', function () {
    Notification::fake();

    $user = User::factory()->unverified()->create();

    $this->actingAs($user)
        ->post(route('verification.send'))
        ->assertSessionHas('status', 'Verification link sent!');

    Notification::assertSentTo($user, VerifyEmail::class);
});
