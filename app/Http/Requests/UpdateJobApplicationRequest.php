<?php

namespace App\Http\Requests;

class UpdateJobApplicationRequest extends StoreJobApplicationRequest
{
    public function rules(): array
    {
        return [
            'company_name' => ['sometimes', 'required', 'string', 'max:255'],
            'job_title' => ['sometimes', 'required', 'string', 'max:255'],
            'job_url' => ['nullable', 'url', 'max:2048'],
            'job_description' => ['nullable', 'string'],
            'location' => ['sometimes', 'required', 'string', 'max:255'],
            'status' => ['sometimes', 'required', 'string', 'in:wishlist,applied,interviewing,offer,rejected,withdrawn'],
            'date_applied' => ['nullable', 'date'],
            'expected_salary' => ['nullable', 'integer', 'min:0'],
            'offered_salary' => ['nullable', 'integer', 'min:0'],
            'notes' => ['nullable', 'string'],
            'interview_date' => ['nullable', 'date'],
            'interview_notes' => ['nullable', 'string'],
        ];
    }
}
