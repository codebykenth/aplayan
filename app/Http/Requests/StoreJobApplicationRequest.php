<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreJobApplicationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'company_name' => ['required', 'string', 'max:255'],
            'job_title' => ['required', 'string', 'max:255'],
            'job_url' => ['nullable', 'url', 'max:2048'],
            'job_description' => ['nullable', 'string'],
            'location' => ['required', 'string', 'max:255'],
            'status' => ['required', 'string', 'in:wishlist,applied,interviewing,offer,rejected,withdrawn'],
            'date_applied' => ['nullable', 'date'],
            'expected_salary' => ['nullable', 'integer', 'min:0'],
            'offered_salary' => ['nullable', 'integer', 'min:0'],
            'notes' => ['nullable', 'string'],
            'interview_date' => ['nullable', 'date'],
        ];
    }
}
