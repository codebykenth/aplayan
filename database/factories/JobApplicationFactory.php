<?php

namespace Database\Factories;

use App\Models\JobApplication;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<JobApplication>
 */
class JobApplicationFactory extends Factory
{
    protected $model = JobApplication::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'company_name' => fake()->company(),
            'job_title' => fake()->jobTitle(),
            'job_url' => fake()->url(),
            'job_description' => fake()->paragraph(),
            'location' => fake()->randomElement(['Metro Manila', 'Cebu', 'Davao', 'Remote PH', 'Foreign Remote']),
            'status' => 'wishlist',
            'date_applied' => fake()->optional()->date(),
            'expected_salary' => fake()->optional()->numberBetween(20000, 200000),
            'offered_salary' => fake()->optional()->numberBetween(20000, 200000),
            'notes' => fake()->optional()->sentence(),
            'ai_match_percentage' => null,
            'ai_strengths' => null,
            'ai_gaps' => null,
            'ai_salary_min' => null,
            'ai_salary_max' => null,
            'ai_salary_notes' => null,
            'ai_evaluated_at' => null,
        ];
    }
}
