<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email,'.$this->user()->id],
            'expected_salary' => ['nullable', 'integer', 'min:0'],
            'base_currency' => ['nullable', 'string', 'in:PHP,USD,EUR,GBP,AUD,CAD,SGD,JPY,AED,NZD'],
            'job_search_preferences' => ['nullable', 'array'],
            'theme' => ['sometimes', 'string', 'in:light,dark,system'],
            'color_theme' => ['sometimes', 'string', 'in:zinc,emerald,ocean,indigo,sunset'],
        ];
    }
}
