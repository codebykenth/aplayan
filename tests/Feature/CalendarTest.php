<?php

use App\Models\JobApplication;
use App\Models\User;

 beforeEach(function () {
     $this->user = User::factory()->create();
     $this->otherUser = User::factory()->create();
 });

it('redirects unauthenticated users to login', function () {
    $this->get('/calendar')->assertRedirect();
});

it('renders the calendar page for authenticated users', function () {
    JobApplication::factory()->count(3)->create(['user_id' => $this->user->id]);

    $this->actingAs($this->user)
        ->get('/calendar')
        ->assertInertia(fn ($page) => $page
            ->component('calendar/index')
        );
});

it('returns interview events within the requested month', function () {
    JobApplication::factory()->create([
        'user_id' => $this->user->id,
        'interview_date' => '2025-08-15 10:00:00',
    ]);

    $this->actingAs($this->user)
        ->get('/calendar?month=8&year=2025')
        ->assertInertia(fn ($page) => $page
            ->where('events.0.type', 'interview')
            ->where('events.0.interview_date', '2025-08-15T10:00:00+00:00')
            ->has('events', 1)
        );
});

it('returns application events from date_applied within the requested month', function () {
    JobApplication::factory()->create([
        'user_id' => $this->user->id,
        'date_applied' => '2025-08-01',
    ]);

    $this->actingAs($this->user)
        ->get('/calendar?month=8&year=2025')
        ->assertInertia(fn ($page) => $page
            ->where('events.0.type', 'application')
        );
});

it('computes follow-up deadlines and returns them as events', function () {
    JobApplication::factory()->create([
        'user_id' => $this->user->id,
        'date_applied' => '2025-06-25',
    ]);

    $this->actingAs($this->user)
        ->get('/calendar?month=7&year=2025')
        ->assertInertia(fn ($page) => $page
            ->where('events.0.type', 'follow_up')
            ->has('events', 1)
        );
});

it('only returns events belonging to the authenticated user', function () {
    JobApplication::factory()->create([
        'user_id' => $this->user->id,
        'interview_date' => '2025-08-15 10:00:00',
    ]);
    JobApplication::factory()->create([
        'user_id' => $this->otherUser->id,
        'interview_date' => '2025-08-20 10:00:00',
    ]);

    $this->actingAs($this->user)
        ->get('/calendar?month=8&year=2025')
        ->assertInertia(fn ($page) => $page
            ->where('events.0.interview_date', '2025-08-15T10:00:00+00:00')
            ->has('events', 1)
        );
});

it('includes status on events for color coding', function () {
    JobApplication::factory()->create([
        'user_id' => $this->user->id,
        'interview_date' => '2025-08-15 10:00:00',
        'status' => 'interviewing',
    ]);

    $this->actingAs($this->user)
        ->get('/calendar?month=8&year=2025')
        ->assertInertia(fn ($page) => $page
            ->where('events.0.status', 'interviewing')
        );
});

it('defaults to current month when no month/year params provided', function () {
    JobApplication::factory()->create([
        'user_id' => $this->user->id,
        'interview_date' => now(),
    ]);

    $this->actingAs($this->user)
        ->get('/calendar')
        ->assertInertia(fn ($page) => $page
            ->has('events')
        );
});

it('scopes events to the authenticated user when another user has applications', function () {
    JobApplication::factory()->count(5)->create([
        'user_id' => $this->otherUser->id,
        'interview_date' => now(),
    ]);

    $this->actingAs($this->user)
        ->get('/calendar')
        ->assertInertia(fn ($page) => $page
            ->where('events', [])
        );
});