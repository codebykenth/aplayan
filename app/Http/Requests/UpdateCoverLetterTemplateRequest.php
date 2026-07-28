<?php

namespace App\Http\Requests;

class UpdateCoverLetterTemplateRequest extends StoreCoverLetterTemplateRequest
{
    public function rules(): array
    {
        return parent::rules();
    }
}
