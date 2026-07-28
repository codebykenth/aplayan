<?php

namespace App\Http\Requests;

use App\Support\Sanitizer;
use Illuminate\Foundation\Http\FormRequest;

class MarkAsContactedRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'date' => ['nullable', 'string'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge(
            Sanitizer::sanitizeArray($this->all()),
        );
    }
}
