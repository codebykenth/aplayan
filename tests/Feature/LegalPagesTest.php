<?php

use App\Models\User;

test('privacy policy page can be rendered for guests', function () {
    $response = $this->get(route('privacy-policy'));

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page->component('public/privacy-policy/index'));
});

test('terms of service page can be rendered for guests', function () {
    $response = $this->get(route('terms-of-service'));

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page->component('public/terms-of-service/index'));
});

test('privacy policy page can be rendered for authenticated users', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('privacy-policy'));

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page->component('public/privacy-policy/index'));
});

test('terms of service page can be rendered for authenticated users', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)->get(route('terms-of-service'));

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page->component('public/terms-of-service/index'));
});
