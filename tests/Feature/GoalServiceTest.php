<?php

use App\Models\JobApplication;
use App\Models\User;
use App\Services\GoalService;
use Carbon\Carbon;

beforeEach(function () {
    $this->service = new GoalService;
    $this->user = User::factory()->create(['weekly_goal' => 5]);
});

it('returns 0 weekly progress when no applications submitted this week', function () {
    $progress = $this->service->weeklyProgress($this->user);

    expect($progress)->toBe(0);
});

it('returns correct weekly progress count', function () {
    $this->travelTo(Carbon::parse('2025-07-01'));

    JobApplication::factory()->count(3)->create([
        'user_id' => $this->user->id,
        'created_at' => now(),
    ]);

    $progress = $this->service->weeklyProgress($this->user);

    expect($progress)->toBe(3);

    $this->travelBack();
});

it('returns 0 four week average when no applications exist', function () {
    $average = $this->service->fourWeekAverage($this->user);

    expect($average)->toBe(0.0);
});

it('calculates four week average correctly', function () {
    $this->travelTo(Carbon::parse('2025-07-01'));

    JobApplication::factory()->count(5)->create([
        'user_id' => $this->user->id,
        'created_at' => now(),
    ]);

    JobApplication::factory()->count(3)->create([
        'user_id' => $this->user->id,
        'created_at' => now()->subWeek(),
    ]);

    JobApplication::factory()->count(2)->create([
        'user_id' => $this->user->id,
        'created_at' => now()->subWeeks(3),
    ]);

    $average = $this->service->fourWeekAverage($this->user);

    expect($average)->toBe(2.5);

    $this->travelBack();
});

it('returns 0 streak when no weeks hit the goal', function () {
    $streak = $this->service->currentStreak($this->user);

    expect($streak)->toBe(0);
});

it('calculates streak counting consecutive weeks hitting the goal', function () {
    $this->travelTo(Carbon::parse('2025-07-01'));

    $this->user->update(['weekly_goal' => 3]);

    // Current week: 4 apps (goal: 3) -> hit
    JobApplication::factory()->count(4)->create([
        'user_id' => $this->user->id,
        'created_at' => now(),
    ]);

    // Week -1: 3 apps -> hit
    JobApplication::factory()->count(3)->create([
        'user_id' => $this->user->id,
        'created_at' => now()->subWeek(),
    ]);

    // Week -2: 5 apps -> hit
    JobApplication::factory()->count(5)->create([
        'user_id' => $this->user->id,
        'created_at' => now()->subWeeks(2),
    ]);

    // Week -3: 1 app -> miss (breaks streak)
    JobApplication::factory()->create([
        'user_id' => $this->user->id,
        'created_at' => now()->subWeeks(3),
    ]);

    $streak = $this->service->currentStreak($this->user);

    expect($streak)->toBe(3);

    $this->travelBack();
});

it('resets streak when most recent week misses the goal', function () {
    $this->travelTo(Carbon::parse('2025-07-01'));

    $this->user->update(['weekly_goal' => 3]);

    // Current week: 1 app (goal: 3) -> miss
    JobApplication::factory()->create([
        'user_id' => $this->user->id,
        'created_at' => now(),
    ]);

    // Week -1: 4 apps -> would be a hit if current week hit
    JobApplication::factory()->count(4)->create([
        'user_id' => $this->user->id,
        'created_at' => now()->subWeek(),
    ]);

    $streak = $this->service->currentStreak($this->user);

    expect($streak)->toBe(0);

    $this->travelBack();
});

it('returns weekly history with 4 entries', function () {
    $history = $this->service->weeklyHistory($this->user);

    expect($history)->toHaveCount(4);
});

it('marks the last entry as current week', function () {
    $this->travelTo(Carbon::parse('2025-07-01'));

    $history = $this->service->weeklyHistory($this->user);

    expect($history[3]['is_current'])->toBeTrue();

    $this->travelBack();
});

it('returns all goal data via forUser method', function () {
    $data = $this->service->forUser($this->user);

    expect($data)->toHaveKeys([
        'weekly_goal',
        'current_streak',
        'weekly_progress',
        'four_week_average',
        'weekly_history',
    ]);
});
