<?php

namespace App\Http\Requests;

use App\Support\Sanitizer;
use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $this->merge(
            Sanitizer::sanitizeArray($this->all()),
        );
    }

    public function rules(): array
    {
        $user = $this->user();

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'email',
                'max:255',
                'unique:users,email,'.$user->id,
                function ($attribute, $value, $fail) use ($user) {
                    if ($user->hasVerifiedEmail() && strtolower((string) $value) !== strtolower((string) $user->email)) {
                        $fail('Verified email addresses cannot be changed.');
                    }
                },
            ],
            'expected_salary' => ['nullable', 'integer', 'min:0'],
            'base_currency' => ['nullable', 'string', 'in:PHP,USD,EUR,GBP,AUD,CAD,SGD,JPY,AED,NZD'],
            'job_search_preferences' => ['nullable', 'array'],
            'theme' => ['sometimes', 'string', 'in:light,dark,system'],
            'color_theme' => ['sometimes', 'string', 'in:zinc,emerald,ocean,indigo,sunset'],
        ];
    }
}
