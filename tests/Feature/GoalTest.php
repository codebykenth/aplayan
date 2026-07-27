<?php

use App\Models\JobApplication;
use App\Models\User;
use Carbon\Carbon;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->otherUser = User::factory()->create();
});

it('redirects unauthenticated users to login for goals index', function () {
    $this->get(route('goals.index'))->assertRedirect();
});

it('redirects unauthenticated users to login for goals update', function () {
    $this->patch(route('goals.update'))->assertRedirect();
});

it('renders the goals page for authenticated users', function () {
    $this->actingAs($this->user)
        ->get(route('goals.index'))
        ->assertInertia(fn ($page) => $page
            ->component('goals/index')
            ->hasAll(['weekly_goal', 'current_streak', 'weekly_progress', 'four_week_average', 'weekly_history'])
        );
});

it('returns the default weekly goal of 10', function () {
    $this->actingAs($this->user)
        ->get(route('goals.index'))
        ->assertInertia(fn ($page) => $page
            ->where('weekly_goal', 10)
        );
});

it('returns the correct weekly goal after update', function () {
    $this->actingAs($this->user)
        ->patch(route('goals.update'), ['weekly_goal' => 15])
        ->assertSessionHas('status', 'Weekly goal updated successfully.');

    $this->actingAs($this->user)
        ->get(route('goals.index'))
        ->assertInertia(fn ($page) => $page
            ->where('weekly_goal', 15)
        );
});

it('validates weekly goal is required', function () {
    $this->actingAs($this->user)
        ->patch(route('goals.update'), ['weekly_goal' => ''])
        ->assertSessionHasErrors(['weekly_goal']);
});

it('validates weekly goal is an integer', function () {
    $this->actingAs($this->user)
        ->patch(route('goals.update'), ['weekly_goal' => 'abc'])
        ->assertSessionHasErrors(['weekly_goal']);
});

it('validates weekly goal minimum is 1', function () {
    $this->actingAs($this->user)
        ->patch(route('goals.update'), ['weekly_goal' => 0])
        ->assertSessionHasErrors(['weekly_goal']);
});

it('validates weekly goal maximum is 100', function () {
    $this->actingAs($this->user)
        ->patch(route('goals.update'), ['weekly_goal' => 101])
        ->assertSessionHasErrors(['weekly_goal']);
});

it('calculates weekly progress correctly', function () {
    $this->travelTo(Carbon::parse('2025-07-01'));

    JobApplication::factory()->count(3)->create([
        'user_id' => $this->user->id,
        'created_at' => now(),
    ]);
    JobApplication::factory()->create([
        'user_id' => $this->user->id,
        'created_at' => now()->subDays(10),
    ]);

    $this->actingAs($this->user)
        ->get(route('goals.index'))
        ->assertInertia(fn ($page) => $page
            ->where('weekly_progress', 3)
        );

    $this->travelBack();
});

it('scopes goals data to the authenticated user', function () {
    JobApplication::factory()->count(5)->create([
        'user_id' => $this->otherUser->id,
        'created_at' => now(),
    ]);

    $this->actingAs($this->user)
        ->get(route('goals.index'))
        ->assertInertia(fn ($page) => $page
            ->where('weekly_progress', 0)
        );
});

it('returns streak of 0 when no applications exist', function () {
    $this->actingAs($this->user)
        ->get(route('goals.index'))
        ->assertInertia(fn ($page) => $page
            ->where('current_streak', 0)
        );
});

it('calculates streak correctly for consecutive weekly goal hits', function () {
    $this->travelTo(Carbon::parse('2025-07-01'));

    $this->user->update(['weekly_goal' => 3]);
    $this->actingAs($this->user);

    // This week: 3 apps (hit goal)
    JobApplication::factory()->count(3)->create([
        'user_id' => $this->user->id,
        'created_at' => now(),
    ]);

    // Last week: 4 apps (hit goal)
    $lastWeek = now()->subWeek();
    JobApplication::factory()->count(4)->create([
        'user_id' => $this->user->id,
        'created_at' => $lastWeek,
    ]);

    // 2 weeks ago: 2 apps (missed)
    $twoWeeksAgo = now()->subWeeks(2);
    JobApplication::factory()->count(2)->create([
        'user_id' => $this->user->id,
        'created_at' => $twoWeeksAgo,
    ]);

    $this->get(route('goals.index'))
        ->assertInertia(fn ($page) => $page
            ->where('current_streak', 2)
        );

    $this->travelBack();
});
