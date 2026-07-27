<?php

namespace Database\Factories;

use App\Models\SavedCoverLetter;
use Illuminate\Database\Eloquent\Factories\Factory;

class SavedCoverLetterFactory extends Factory
{
    protected $model = SavedCoverLetter::class;

    public function definition(): array
    {
        return [
            'job_description' => fake()->paragraphs(3, true),
            'content' => "Dear Hiring Manager,\n\n".fake()->paragraphs(2, true)."\n\nSincerely,\n".fake()->name(),
        ];
    }
}
