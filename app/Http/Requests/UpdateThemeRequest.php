<?php

namespace App\Http\Requests;

use App\Support\Sanitizer;
use Illuminate\Foundation\Http\FormRequest;

class UpdateThemeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'theme' => ['required', 'string', 'in:light,dark,system'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge(
            Sanitizer::sanitizeArray($this->all()),
        );
    }
}
