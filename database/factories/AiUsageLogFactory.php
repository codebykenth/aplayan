<?php

namespace Database\Factories;

use App\Models\AiUsageLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AiUsageLog>
 */
class AiUsageLogFactory extends Factory
{
    protected $model = AiUsageLog::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'feature_type' => fake()->randomElement(['job_match', 'salary_check', 'cover_letter', 'interview_prep', 'resume_polish']),
            'prompt_tokens' => fake()->numberBetween(50, 500),
            'completion_tokens' => fake()->numberBetween(100, 1000),
            'total_tokens' => fn (array $attrs) => $attrs['prompt_tokens'] + $attrs['completion_tokens'],
            'is_cache_hit' => false,
            'estimated_cost' => fn (array $attrs) => round(($attrs['prompt_tokens'] * 0.075 + $attrs['completion_tokens'] * 0.30) / 1_000_000, 6),
        ];
    }

    public function cacheHit(): static
    {
        return $this->state(fn (array $attributes) => [
            'prompt_tokens' => 0,
            'completion_tokens' => 0,
            'total_tokens' => 0,
            'is_cache_hit' => true,
            'estimated_cost' => 0.000000,
        ]);
    }
}
