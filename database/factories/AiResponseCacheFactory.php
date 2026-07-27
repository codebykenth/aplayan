<?php

namespace Database\Factories;

use App\Models\AiResponseCache;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AiResponseCache>
 */
class AiResponseCacheFactory extends Factory
{
    protected $model = AiResponseCache::class;

    public function definition(): array
    {
        return [
            'canonical_key' => hash('sha256', fake()->unique()->sentence()),
            'feature_type' => fake()->randomElement(['job_match', 'salary_check', 'resume_polish', 'cover_letter_polish', 'interview_prep']),
            'normalized_company' => fake()->optional()->company(),
            'normalized_title' => fake()->optional()->jobTitle(),
            'response_data' => ['result' => fake()->sentence()],
            'hit_count' => 1,
            'expires_at' => null,
        ];
    }
}
