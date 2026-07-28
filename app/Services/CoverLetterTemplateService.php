<?php

namespace App\Services;

use App\Models\CoverLetterTemplate;
use App\Models\User;
use Illuminate\Support\Collection;

class CoverLetterTemplateService
{
    public function listForUser(User $user): Collection
    {
        return $user->coverLetterTemplates()->latest()->get();
    }

    public function createForUser(User $user, array $data): CoverLetterTemplate
    {
        return $user->coverLetterTemplates()->create($data);
    }

    public function updateForUser(CoverLetterTemplate $template, array $data): CoverLetterTemplate
    {
        $template->update($data);

        return $template;
    }

    public function deleteForUser(CoverLetterTemplate $template): void
    {
        $template->delete();
    }
}
