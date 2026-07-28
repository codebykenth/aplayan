<?php

namespace Database\Factories;

use App\Models\CoverLetterTemplate;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<CoverLetterTemplate>
 */
class CoverLetterTemplateFactory extends Factory
{
    protected $model = CoverLetterTemplate::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'title' => fake()->jobTitle().' Cover Letter',
            'recipient' => fake()->randomElement(['Hiring Manager', 'HR Team', 'Engineering Manager', null]),
            'content' => fake()->paragraphs(3, true),
        ];
    }
}
