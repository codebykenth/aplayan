<?php

namespace Database\Factories;

use App\Models\ResumeProfile;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ResumeProfile>
 */
class ResumeProfileFactory extends Factory
{
    protected $model = ResumeProfile::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'target_role' => fake()->optional(0.6)->jobTitle(),
            'full_name' => fake()->name(),
            'email' => fake()->safeEmail(),
            'phone' => '+63 9'.fake()->numerify('## #####'),
            'location' => fake()->randomElement(['Metro Manila', 'Cebu City', 'Davao City', 'Remote']),
            'linkedin_url' => fake()->optional(0.7)->url(),
            'summary' => fake()->paragraph(),
            'work_experience' => [
                [
                    'company' => fake()->company(),
                    'position' => fake()->jobTitle(),
                    'duration' => fake()->year().' - '.fake()->year(),
                    'description' => fake()->sentence(),
                ],
            ],
            'education' => [
                [
                    'institution' => fake()->randomElement(['UP Diliman', 'UST', 'DLSU', 'Ateneo']),
                    'degree' => fake()->randomElement(['BS Computer Science', 'BS Information Technology', 'BS Engineering']),
                    'year' => (string) fake()->year(),
                ],
            ],
            'skills' => fake()->randomElements(['PHP', 'Laravel', 'React', 'JavaScript', 'TypeScript', 'Python', 'SQL', 'Git', 'Docker', 'AWS'], 3),
            'certifications' => fake()->optional(0.5)->randomElements(['AWS Solutions Architect', 'Google Cloud Professional', 'Certified Scrum Master'], 1) ?? [],
        ];
    }
}
