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
            'target_role' => ['nullable', 'string', 'max:255'],
            'full_name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['required', 'string', 'max:50'],
            'location' => ['required', 'string', 'max:255'],
            'photo_url' => ['nullable', 'string', 'max:500'],
            'linkedin_url' => ['nullable', 'string', 'max:500'],
            'github_url' => ['nullable', 'string', 'max:500'],
            'website_url' => ['nullable', 'string', 'max:500'],
            'summary' => ['nullable', 'string', 'max:5000'],
            'work_experience' => ['sometimes', 'array'],
            'work_experience.*.company' => ['required_with:work_experience', 'string', 'max:255'],
            'work_experience.*.position' => ['required_with:work_experience', 'string', 'max:255'],
            'work_experience.*.duration' => ['required_with:work_experience', 'string', 'max:100'],
            'work_experience.*.description' => ['nullable', 'string', 'max:2000'],
            'work_experience.*.location' => ['nullable', 'string', 'max:255'],
            'education' => ['sometimes', 'array'],
            'education.*.institution' => ['required_with:education', 'string', 'max:255'],
            'education.*.degree' => ['required_with:education', 'string', 'max:255'],
            'education.*.year' => ['required_with:education', 'string', 'max:20'],
            'education.*.location' => ['nullable', 'string', 'max:255'],
            'skills' => ['sometimes', 'array'],
            'skills.*' => ['string', 'max:100'],
            'certifications' => ['sometimes', 'array'],
            'certifications.*' => ['string', 'max:255'],
            'projects' => ['sometimes', 'array'],
            'projects.*.title' => ['required_with:projects', 'string', 'max:255'],
            'projects.*.description' => ['nullable', 'string', 'max:2000'],
            'projects.*.url' => ['nullable', 'string', 'max:500'],
            'projects.*.github_url' => ['nullable', 'string', 'max:500'],
            'projects.*.technologies' => ['nullable', 'string', 'max:500'],
            'projects.*.duration' => ['nullable', 'string', 'max:100'],
            'additional_info' => ['sometimes', 'array'],
            'additional_info.*.label' => ['required_with:additional_info', 'string', 'max:255'],
            'additional_info.*.value' => ['required_with:additional_info', 'string', 'max:1000'],
        ];
    }
}
