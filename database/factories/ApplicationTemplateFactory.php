<?php

namespace Database\Factories;

use App\Models\ApplicationTemplate;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ApplicationTemplate>
 */
class ApplicationTemplateFactory extends Factory
{
    protected $model = ApplicationTemplate::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'name' => fake()->jobTitle().' Template',
            'category' => fake()->randomElement(['Remote Frontend', 'BPO Cebu', 'Government PH', null]),
            'default_location' => fake()->randomElement(['Remote', 'Cebu City', 'Manila', 'Makati']),
            'default_expected_salary' => fake()->randomElement([30000, 45000, 60000, 80000, null]),
            'default_job_description_keywords' => fake()->sentence(),
            'default_notes' => fake()->optional()->sentence(),
        ];
    }
}
