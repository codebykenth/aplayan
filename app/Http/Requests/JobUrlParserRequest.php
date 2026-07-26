<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class JobUrlParserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'job_url' => ['required', 'url', 'max:2048'],
        ];
    }
}
