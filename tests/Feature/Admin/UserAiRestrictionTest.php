<?php

use App\Models\User;

beforeEach(function () {
    $this->admin = User::factory()->admin()->create();
});

test('admin can toggle ai disabled on a user account', function () {
    $user = User::factory()->create(['is_ai_disabled' => false]);

    $response = $this->actingAs($this->admin)
        ->post(route('admin.users.toggle-ai', $user));

    $response->assertSessionHas('status');
    expect($user->fresh()->is_ai_disabled)->toBeTrue();
});

test('admin can toggle ai disabled back to enabled', function () {
    $user = User::factory()->aiDisabled()->create();

    $response = $this->actingAs($this->admin)
        ->post(route('admin.users.toggle-ai', $user));

    $response->assertSessionHas('status');
    expect($user->fresh()->is_ai_disabled)->toBeFalse();
});

test('admin can set custom ai daily limit for a user', function () {
    $user = User::factory()->create(['custom_ai_daily_limit' => null]);

    $response = $this->actingAs($this->admin)
        ->post(route('admin.users.ai-limit', $user), [
            'limit' => 25,
        ]);

    $response->assertSessionHas('status');
    expect($user->fresh()->custom_ai_daily_limit)->toBe(25);
});

test('admin can remove custom ai daily limit by passing null', function () {
    $user = User::factory()->create(['custom_ai_daily_limit' => 25]);

    $response = $this->actingAs($this->admin)
        ->post(route('admin.users.ai-limit', $user), [
            'limit' => '',
        ]);

    $response->assertSessionHas('status');
    expect($user->fresh()->custom_ai_daily_limit)->toBeNull();
});

test('regular user cannot toggle ai access', function () {
    $user = User::factory()->create(['role' => 'user']);
    $target = User::factory()->create();

    $response = $this->actingAs($user)
        ->post(route('admin.users.toggle-ai', $target));

    $response->assertForbidden();
});

test('regular user cannot set ai daily limit', function () {
    $user = User::factory()->create(['role' => 'user']);
    $target = User::factory()->create();

    $response = $this->actingAs($user)
        ->post(route('admin.users.ai-limit', $target), [
            'limit' => 25,
        ]);

    $response->assertForbidden();
});

test('ai limit validation rejects negative numbers', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($this->admin)
        ->post(route('admin.users.ai-limit', $user), [
            'limit' => -1,
        ]);

    $response->assertSessionHasErrors('limit');
});

test('ai limit validation rejects values above 1000', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($this->admin)
        ->post(route('admin.users.ai-limit', $user), [
            'limit' => 1001,
        ]);

    $response->assertSessionHasErrors('limit');
});
