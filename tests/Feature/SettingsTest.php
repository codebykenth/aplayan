<?php

use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
});

it('redirects unauthenticated users to login', function () {
    $this->get(route('settings.index'))->assertRedirect();
    $this->patch(route('settings.profile.update'), [])->assertRedirect();
    $this->patch(route('settings.password.update'), [])->assertRedirect();
});

it('shows the settings page for authenticated users', function () {
    $this->actingAs($this->user)
        ->get(route('settings.index'))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->component('settings/index')
            ->has('user', fn ($user) => $user
                ->where('id', $this->user->id)
                ->where('name', $this->user->name)
                ->where('theme', 'system')
                ->etc()
            )
        );
});

it('updates the profile name and email', function () {
    $this->actingAs($this->user)->patch(route('settings.profile.update'), [
        'name' => 'New Name',
        'email' => 'new@example.com',
        'theme' => 'system',
    ])->assertRedirect(route('settings.index'));

    $this->assertDatabaseHas('users', [
        'id' => $this->user->id,
        'name' => 'New Name',
        'email' => 'new@example.com',
    ]);
});

it('updates expected salary', function () {
    $this->actingAs($this->user)->patch(route('settings.profile.update'), [
        'name' => $this->user->name,
        'email' => $this->user->email,
        'expected_salary' => 75000,
        'theme' => 'system',
    ])->assertRedirect();

    $this->assertDatabaseHas('users', [
        'id' => $this->user->id,
        'expected_salary' => 75000,
    ]);
});

it('updates theme preference via dedicated endpoint', function () {
    $this->actingAs($this->user)
        ->patch(route('settings.theme.update'), [
            'theme' => 'dark',
        ])
        ->assertRedirect();

    $this->assertDatabaseHas('users', [
        'id' => $this->user->id,
        'theme' => 'dark',
    ]);
});

it('updates theme preference via profile endpoint', function () {
    $this->actingAs($this->user)->patch(route('settings.profile.update'), [
        'name' => $this->user->name,
        'email' => $this->user->email,
        'theme' => 'dark',
    ])->assertRedirect();

    $this->assertDatabaseHas('users', [
        'id' => $this->user->id,
        'theme' => 'dark',
    ]);
});

it('updates job search preferences', function () {
    $preferences = ['locations' => ['Remote', 'Metro Manila'], 'role' => 'Developer'];

    $this->actingAs($this->user)->patch(route('settings.profile.update'), [
        'name' => $this->user->name,
        'email' => $this->user->email,
        'job_search_preferences' => $preferences,
        'theme' => 'system',
    ])->assertRedirect();

    $this->assertDatabaseHas('users', [
        'id' => $this->user->id,
    ]);

    $this->user->refresh();
    expect($this->user->job_search_preferences)->toBe($preferences);
});

it('validates theme is required on dedicated endpoint', function () {
    $this->actingAs($this->user)
        ->patchJson(route('settings.theme.update'), [])
        ->assertJsonValidationErrors(['theme']);
});

it('validates required fields on profile update', function () {
    $this->actingAs($this->user)
        ->patchJson(route('settings.profile.update'), [])
        ->assertJsonValidationErrors(['name', 'email', 'theme']);
});

it('validates theme must be valid value on profile endpoint', function () {
    $this->actingAs($this->user)
        ->patchJson(route('settings.theme.update'), ['theme' => 'invalid'])
        ->assertJsonValidationErrors(['theme']);
});

it('validates theme must be valid value on profile update', function () {
    $this->actingAs($this->user)
        ->patchJson(route('settings.profile.update'), [
            'name' => 'Test',
            'email' => $this->user->email,
            'theme' => 'invalid',
        ])
        ->assertJsonValidationErrors(['theme']);
});

it('validates email uniqueness on profile update', function () {
    $other = User::factory()->create(['email' => 'other@example.com']);

    $this->actingAs($this->user)
        ->patchJson(route('settings.profile.update'), [
            'name' => 'Test',
            'email' => 'other@example.com',
            'theme' => 'system',
        ])
        ->assertJsonValidationErrors(['email']);
});

it('allows keeping the same email on profile update', function () {
    $this->actingAs($this->user)
        ->patchJson(route('settings.profile.update'), [
            'name' => 'Updated',
            'email' => $this->user->email,
            'theme' => 'system',
        ])
        ->assertRedirect();
});

it('updates the password', function () {
    $this->actingAs($this->user)->patch(route('settings.password.update'), [
        'current_password' => 'password',
        'password' => 'NewPassword123!',
        'password_confirmation' => 'NewPassword123!',
    ])->assertRedirect(route('settings.index'));
});

it('validates current password on password update', function () {
    $this->actingAs($this->user)
        ->patchJson(route('settings.password.update'), [
            'current_password' => 'wrong-password',
            'password' => 'NewPassword123!',
            'password_confirmation' => 'NewPassword123!',
        ])
        ->assertJsonValidationErrors(['current_password']);
});

it('validates password confirmation on password update', function () {
    $this->actingAs($this->user)
        ->patchJson(route('settings.password.update'), [
            'current_password' => 'password',
            'password' => 'NewPassword123!',
            'password_confirmation' => 'different',
        ])
        ->assertJsonValidationErrors(['password']);
});
