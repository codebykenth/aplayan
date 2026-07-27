<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class AiPolishResumeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'section' => ['required', 'string', 'in:summary,work_experience,projects'],
            'content' => ['required', 'string', 'max:5000'],
            'context' => ['nullable', 'string', 'max:1000'],
        ];
    }
}
