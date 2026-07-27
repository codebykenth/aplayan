<?php

namespace Database\Factories;

use App\Models\SavedResume;
use Illuminate\Database\Eloquent\Factories\Factory;

class SavedResumeFactory extends Factory
{
    protected $model = SavedResume::class;

    public function definition(): array
    {
        return [
            'name' => fake()->words(3, true),
            'template' => fake()->randomElement(['clean', 'modern', 'philippine']),
            'profile_data' => [
                'full_name' => fake()->name(),
                'email' => fake()->safeEmail(),
                'phone' => fake()->phoneNumber(),
                'location' => fake()->city(),
                'linkedin_url' => 'https://linkedin.com/in/'.fake()->userName(),
                'summary' => fake()->paragraph(),
                'work_experience' => [
                    ['company' => fake()->company(), 'position' => fake()->jobTitle(), 'duration' => '2020-2023', 'description' => fake()->sentence()],
                ],
                'education' => [
                    ['institution' => fake()->company(), 'degree' => fake()->word(), 'year' => (string) fake()->year()],
                ],
                'skills' => ['PHP', 'Laravel', 'React'],
                'certifications' => ['AWS Certified'],
            ],
            'photo_url' => null,
        ];
    }
}
