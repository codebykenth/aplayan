<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('the welcome page loads successfully', function () {
    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('welcome'));
});

test('the welcome page contains the correct inertia component', function () {
    $this->get(route('home'))
        ->assertInertia(fn ($page) => $page
            ->component('welcome')
            ->has('name')
            ->has('auth')
        );
});

test('guests can access the welcome page', function () {
    $this->assertGuest();

    $this->get(route('home'))
        ->assertOk();
});

test('authenticated users can still access the welcome page', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('home'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('welcome'));
});
