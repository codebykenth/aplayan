<?php

namespace App\Http\Requests;

use App\Support\Sanitizer;
use Illuminate\Foundation\Http\FormRequest;

class UpdateColorThemeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'color_theme' => ['required', 'string', 'in:zinc,emerald,ocean,indigo,sunset'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge(
            Sanitizer::sanitizeArray($this->all()),
        );
    }
}
