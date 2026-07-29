<?php

namespace App\Http\Requests;

use App\Support\Sanitizer;
use Illuminate\Foundation\Http\FormRequest;

class UpdateTaxSettingsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'tax_settings' => ['nullable', 'array'],
            'tax_settings.regime' => ['nullable', 'string', 'in:ph_regular,ph_freelance_8,tax_exempt,custom'],
            'tax_settings.allowances' => ['nullable', 'array'],
            'tax_settings.allowances.*.name' => ['required_with:tax_settings.allowances', 'string', 'max:255'],
            'tax_settings.allowances.*.amount' => ['required_with:tax_settings.allowances', 'numeric', 'min:0'],
            'tax_settings.allowances.*.taxable' => ['required_with:tax_settings.allowances', 'boolean'],
            'tax_settings.custom_deductions' => ['nullable', 'array'],
            'tax_settings.custom_deductions.*.name' => ['required_with:tax_settings.custom_deductions', 'string', 'max:255'],
            'tax_settings.custom_deductions.*.amount' => ['required_with:tax_settings.custom_deductions', 'numeric', 'min:0'],
            'tax_settings.override_sss' => ['nullable', 'numeric', 'min:0'],
            'tax_settings.override_philhealth' => ['nullable', 'numeric', 'min:0'],
            'tax_settings.override_pagibig' => ['nullable', 'numeric', 'min:0'],
            'tax_settings.override_bir_tax' => ['nullable', 'numeric', 'min:0'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge(
            Sanitizer::sanitizeArray($this->all()),
        );
    }
}
