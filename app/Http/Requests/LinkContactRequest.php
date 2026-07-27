<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class LinkContactRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'job_application_id' => ['required', 'exists:job_applications,id'],
        ];
    }
}
