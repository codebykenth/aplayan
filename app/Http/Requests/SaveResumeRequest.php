<?php

namespace App\Http\Requests;

use App\Support\Sanitizer;
use Illuminate\Foundation\Http\FormRequest;

class SaveResumeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'template' => ['required', 'string', 'in:clean,modern,philippine,ats_classic,ats_executive,ats_bullet,ats_single_column,ats_classic_serif'],
            'profile_data' => ['required', 'array'],
            'photo_url' => ['nullable', 'string', 'max:500'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $sanitized = Sanitizer::sanitizeArray($this->all());

        if (isset($sanitized['profile_data'])) {
            $sanitized['profile_data'] = $this->input('profile_data');
        }

        $this->merge($sanitized);
    }
}
