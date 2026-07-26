<?php

namespace App\Http\Requests;

class UpdateApplicationTemplateRequest extends StoreApplicationTemplateRequest
{
    public function rules(): array
    {
        return parent::rules();
    }
}
