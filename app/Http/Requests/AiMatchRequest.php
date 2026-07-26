<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AiMatchRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'resume_text' => ['required_without:resume_file', 'string', 'max:50000'],
            'resume_file' => ['required_without:resume_text', 'file', 'mimes:txt,pdf', 'max:2048'],
        ];
    }

    public function messages(): array
    {
        return [
            'resume_text.required_without' => 'Please provide resume text or upload a file.',
            'resume_file.required_without' => 'Please provide resume text or upload a file.',
        ];
    }
}
