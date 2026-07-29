<?php

use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('the login page is accessible', function () {
    $this->get(route('login'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('auth/login'));
});

test('the register page is accessible', function () {
    $this->get(route('register'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('auth/register'));
});

test('the google oauth redirect route is accessible', function () {
    $this->get(route('google.redirect'))
        ->assertRedirect();
});

test('the forgot password page is accessible', function () {
    $this->get(route('password.request'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page->component('auth/forgot-password'));
});
