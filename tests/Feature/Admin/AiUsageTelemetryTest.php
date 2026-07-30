<?php

use App\Models\AiUsageLog;
use App\Models\User;

beforeEach(function () {
    $this->admin = User::factory()->admin()->create();
});

test('admin can view ai usage dashboard with kpis', function () {
    AiUsageLog::factory()->count(3)->create([
        'user_id' => User::factory()->create()->id,
        'prompt_tokens' => 100,
        'completion_tokens' => 200,
        'total_tokens' => 300,
        'is_cache_hit' => false,
    ]);

    AiUsageLog::factory()->create([
        'is_cache_hit' => true,
    ]);

    $response = $this->actingAs($this->admin)->get(route('admin.ai-usage'));

    $response->assertInertia(function ($page) {
        $page->component('admin/ai-usage/index')
            ->has('kpi', function ($kpi) {
                $kpi->whereType('calls_today', 'integer')
                    ->whereType('token_volume_30d', 'integer')
                    ->whereType('estimated_api_cost_30d', 'double')
                    ->whereType('tokens_saved_via_caching', 'integer');
            })
            ->has('daily_token_usage')
            ->has('top_features')
            ->has('top_consumers');
    });
});

test('admin can view top features breakdown', function () {
    $user = User::factory()->create();

    AiUsageLog::factory()->count(5)->create([
        'user_id' => $user->id,
        'feature_type' => 'job_match',
        'total_tokens' => 500,
    ]);
    AiUsageLog::factory()->count(3)->create([
        'user_id' => $user->id,
        'feature_type' => 'salary_check',
        'total_tokens' => 300,
    ]);

    $response = $this->actingAs($this->admin)->get(route('admin.ai-usage'));

    $response->assertInertia(function ($page) {
        $page->has('top_features', function ($features) {
            $features->each(function ($feature) {
                $feature->whereType('feature_type', 'string')
                    ->whereType('label', 'string')
                    ->whereType('calls', 'integer')
                    ->whereType('total_tokens', 'integer');
            });
        });
    });
});

test('admin can view top consumers leaderboard', function () {
    $user = User::factory()->create();

    AiUsageLog::factory()->count(10)->create([
        'user_id' => $user->id,
        'feature_type' => 'job_match',
        'prompt_tokens' => 100,
        'completion_tokens' => 200,
        'total_tokens' => 300,
        'estimated_cost' => 0.000087,
    ]);

    $response = $this->actingAs($this->admin)->get(route('admin.ai-usage'));

    $response->assertInertia(function ($page) {
        $page->has('top_consumers', function ($consumers) {
            $consumers->each(function ($consumer) {
                $consumer->whereType('id', 'integer')
                    ->whereType('name', 'string')
                    ->whereType('email', 'string')
                    ->whereType('total_calls', 'integer')
                    ->whereType('total_tokens', 'integer')
                    ->whereType('estimated_cost', 'double')
                    ->whereType('is_ai_disabled', 'boolean')
                    ->has('avatar');
            });
        });
    });
});

test('cache hits are logged with is_cache_hit flag', function () {
    $user = User::factory()->create();

    AiUsageLog::create([
        'user_id' => $user->id,
        'feature_type' => 'job_match',
        'prompt_tokens' => 0,
        'completion_tokens' => 0,
        'total_tokens' => 0,
        'is_cache_hit' => true,
        'estimated_cost' => 0.000000,
    ]);

    expect(AiUsageLog::where('is_cache_hit', true)->count())->toBe(1);
    expect(AiUsageLog::where('is_cache_hit', false)->count())->toBe(0);
});

test('daily token usage returns date grouped data', function () {
    $user = User::factory()->create();

    AiUsageLog::factory()->count(2)->create([
        'user_id' => $user->id,
        'feature_type' => 'job_match',
        'created_at' => today(),
    ]);

    AiUsageLog::factory()->create([
        'user_id' => $user->id,
        'feature_type' => 'salary_check',
        'created_at' => today()->subDay(),
    ]);

    $response = $this->actingAs($this->admin)->get(route('admin.ai-usage'));

    $response->assertInertia(function ($page) {
        $page->has('daily_token_usage', function ($daily) {
            $daily->each(function ($entry) {
                $entry->whereType('date', 'string')
                    ->whereType('calls', 'integer')
                    ->whereType('prompt_tokens', 'integer')
                    ->whereType('completion_tokens', 'integer')
                    ->whereType('total_tokens', 'integer');
            });
        });
    });
});
