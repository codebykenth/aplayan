<?php

use App\Models\JobApplication;
use App\Models\User;
use App\Services\ActionFeedService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->service = app(ActionFeedService::class);
    $this->user = User::factory()->create();
});

afterEach(function () {
    Cache::forget("action_feed:{$this->user->id}");
});

it('returns a Collection when data is retrieved from cache', function () {
    JobApplication::factory()->create([
        'user_id' => $this->user->id,
        'status' => 'applied',
        'last_contacted_at' => now()->subDays(10),
        'ai_evaluated_at' => now(),
    ]);

    app()->instance('env', 'production');

    $result = $this->service->forUser($this->user);

    expect($result)->toBeInstanceOf(Collection::class);
});
