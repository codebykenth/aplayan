<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateResumeProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'full_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['required', 'string', 'max:50'],
            'location' => ['required', 'string', 'max:255'],
            'linkedin_url' => ['nullable', 'url', 'max:500'],
            'summary' => ['nullable', 'string', 'max:5000'],
            'work_experience' => ['sometimes', 'array'],
            'work_experience.*.company' => ['required_with:work_experience', 'string', 'max:255'],
            'work_experience.*.position' => ['required_with:work_experience', 'string', 'max:255'],
            'work_experience.*.duration' => ['required_with:work_experience', 'string', 'max:100'],
            'work_experience.*.description' => ['nullable', 'string', 'max:2000'],
            'education' => ['sometimes', 'array'],
            'education.*.institution' => ['required_with:education', 'string', 'max:255'],
            'education.*.degree' => ['required_with:education', 'string', 'max:255'],
            'education.*.year' => ['required_with:education', 'string', 'max:20'],
            'skills' => ['sometimes', 'array'],
            'skills.*' => ['string', 'max:100'],
            'certifications' => ['sometimes', 'array'],
            'certifications.*' => ['string', 'max:255'],
        ];
    }
}
