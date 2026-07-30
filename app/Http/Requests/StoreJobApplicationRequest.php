<?php

namespace App\Http\Requests;

use App\Support\Sanitizer;
use Illuminate\Foundation\Http\FormRequest;

class StoreJobApplicationRequest extends FormRequest
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
        return [
            'company_name' => ['required', 'string', 'max:255'],
            'job_title' => ['required', 'string', 'max:255'],
            'job_url' => ['nullable', 'url', 'max:2048'],
            'job_description' => ['nullable', 'string'],
            'location' => ['nullable', 'string', 'max:255'],
            'work_setup' => ['required', 'string', 'in:remote,hybrid,onsite'],
            'status' => ['required', 'string', 'in:wishlist,applied,interviewing,offer,rejected,withdrawn'],
            'date_applied' => ['nullable', 'date'],
            'expected_salary' => ['nullable', 'integer', 'min:0'],
            'offered_salary' => ['nullable', 'integer', 'min:0'],
            'currency' => ['nullable', 'string', 'in:PHP,USD,EUR,GBP,AUD,CAD,SGD,JPY,AED,NZD'],
            'tax_config' => ['nullable', 'array'],
            'tax_config.regime' => ['nullable', 'string', 'in:ph_regular,ph_freelance_8,tax_exempt,custom'],
            'tax_config.allowances' => ['nullable', 'array'],
            'tax_config.allowances.*.name' => ['required_with:tax_config.allowances', 'string', 'max:255'],
            'tax_config.allowances.*.amount' => ['required_with:tax_config.allowances', 'numeric', 'min:0'],
            'tax_config.allowances.*.taxable' => ['required_with:tax_config.allowances', 'boolean'],
            'tax_config.custom_deductions' => ['nullable', 'array'],
            'tax_config.custom_deductions.*.name' => ['required_with:tax_config.custom_deductions', 'string', 'max:255'],
            'tax_config.custom_deductions.*.amount' => ['required_with:tax_config.custom_deductions', 'numeric', 'min:0'],
            'tax_config.manual_net_override' => ['nullable', 'numeric', 'min:0'],
            'tax_config.override_sss' => ['nullable', 'numeric', 'min:0'],
            'tax_config.override_philhealth' => ['nullable', 'numeric', 'min:0'],
            'tax_config.override_pagibig' => ['nullable', 'numeric', 'min:0'],
            'tax_config.override_bir_tax' => ['nullable', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string'],
            'interview_date' => ['nullable', 'date'],
        ];
    }
}
