<?php

use App\Models\User;

beforeEach(function () {
    $this->admin = User::factory()->admin()->create();
});

test('admin can search users by name', function () {
    User::factory()->create(['name' => 'Jane Doe']);
    User::factory()->create(['name' => 'John Smith']);

    $response = $this->actingAs($this->admin)
        ->get(route('admin.users.index', ['search' => 'Jane']));

    $response->assertInertia(fn ($page) => $page
        ->component('admin/users/index')
        ->has('users.data', 1)
        ->where('filters.search', 'Jane')
    );
});

test('admin can search users by email', function () {
    User::factory()->create(['email' => 'jane@example.com']);
    User::factory()->create(['email' => 'john@example.com']);

    $response = $this->actingAs($this->admin)
        ->get(route('admin.users.index', ['search' => 'jane@example.com']));

    $response->assertInertia(fn ($page) => $page
        ->component('admin/users/index')
        ->has('users.data', 1)
        ->where('filters.search', 'jane@example.com')
    );
});

test('admin can toggle user role from user to admin', function () {
    $user = User::factory()->create(['role' => 'user']);

    $response = $this->actingAs($this->admin)
        ->post(route('admin.users.toggle-role', $user));

    $response->assertSessionHas('status');
    expect($user->fresh()->role)->toBe('admin');
});

test('admin can toggle user role from admin to user', function () {
    $user = User::factory()->admin()->create();

    $response = $this->actingAs($this->admin)
        ->post(route('admin.users.toggle-role', $user));

    $response->assertSessionHas('status');
    expect($user->fresh()->role)->toBe('user');
});

test('admin can delete a non-admin user', function () {
    $user = User::factory()->create(['role' => 'user']);

    $response = $this->actingAs($this->admin)
        ->delete(route('admin.users.destroy', $user));

    $response->assertSessionHas('status');
    expect(User::find($user->id))->toBeNull();
});

test('admin cannot delete the last admin user', function () {
    $response = $this->actingAs($this->admin)
        ->delete(route('admin.users.destroy', $this->admin));

    $response->assertSessionHas('status');
    expect(User::find($this->admin->id))->not->toBeNull();
});

test('admin can view user terms acceptance status', function () {
    $acceptedUser = User::factory()->create([
        'terms_accepted_at' => now()->subDays(2),
    ]);

    $pendingUser = User::factory()->create([
        'terms_accepted_at' => null,
    ]);

    $response = $this->actingAs($this->admin)
        ->get(route('admin.users.index'));

    $response->assertInertia(fn ($page) => $page
        ->component('admin/users/index')
        ->has('users.data')
    );
});
