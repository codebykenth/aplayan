<?php

use App\Models\User;

beforeEach(function () {
    $this->adminRoutes = [
        route('admin.dashboard'),
        route('admin.users.index'),
        route('admin.ai-usage'),
        route('admin.legal-documents.index'),
    ];
});

test('guests are redirected to login when accessing admin routes', function () {
    foreach ($this->adminRoutes as $route) {
        $response = $this->get($route);

        $response->assertRedirect(route('login'));
    }
});

test('regular users receive 403 when accessing admin routes', function () {
    $user = User::factory()->create(['role' => 'user']);

    foreach ($this->adminRoutes as $route) {
        $response = $this->actingAs($user)->get($route);

        $response->assertForbidden();
    }
});

test('admin users can access admin routes successfully', function () {
    $admin = User::factory()->admin()->create();

    foreach ($this->adminRoutes as $route) {
        $response = $this->actingAs($admin)->get($route);

        $response->assertStatus(200);
    }
});

test('admin dashboard displays platform metrics', function () {
    $admin = User::factory()->admin()->create();

    $response = $this->actingAs($admin)->get(route('admin.dashboard'));

    $response->assertInertia(fn ($page) => $page
        ->component('admin/dashboard/index')
        ->has('total_users')
        ->has('active_job_applications')
        ->has('total_resumes')
        ->has('daily_ai_api_calls')
    );
});

test('admin users index displays paginated users', function () {
    $admin = User::factory()->admin()->create();
    User::factory()->count(5)->create();

    $response = $this->actingAs($admin)->get(route('admin.users.index'));

    $response->assertInertia(fn ($page) => $page
        ->component('admin/users/index')
        ->has('users.data')
        ->has('filters')
    );
});
