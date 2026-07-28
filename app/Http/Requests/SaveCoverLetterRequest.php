<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SaveCoverLetterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'content' => ['required', 'string', 'max:50000'],
            'job_description' => ['nullable', 'string', 'max:10000'],
            'target_company' => ['nullable', 'string', 'max:255'],
            'target_job_title' => ['nullable', 'string', 'max:255'],
            'recipient' => ['nullable', 'string', 'max:255'],
            'template' => ['nullable', 'string', 'in:clean,modern,philippine,ats_classic,ats_executive,ats_bullet,cl_modern,cl_formal,cl_executive,cl_creative,cl_minimal'],
        ];
    }
}
