<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreApplicationTemplateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'category' => ['nullable', 'string', 'max:255'],
            'default_location' => ['nullable', 'string', 'max:255'],
            'default_expected_salary' => ['nullable', 'integer', 'min:0'],
            'default_job_description_keywords' => ['nullable', 'string'],
            'default_notes' => ['nullable', 'string'],
        ];
    }
}
