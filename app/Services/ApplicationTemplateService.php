<?php

namespace App\Services;

use App\Models\ApplicationTemplate;
use App\Models\User;
use Illuminate\Support\Collection;

class ApplicationTemplateService
{
    public function listForUser(User $user): Collection
    {
        return $user->applicationTemplates()->latest()->get();
    }

    public function createForUser(User $user, array $data): ApplicationTemplate
    {
        return $user->applicationTemplates()->create($data);
    }

    public function updateForUser(ApplicationTemplate $template, array $data): ApplicationTemplate
    {
        $template->update($data);

        return $template;
    }

    public function deleteForUser(ApplicationTemplate $template): void
    {
        $template->delete();
    }

    public function prefillData(ApplicationTemplate $template): array
    {
        return array_filter([
            'location' => $template->default_location,
            'expected_salary' => $template->default_expected_salary,
            'notes' => $template->default_notes,
            'job_description' => $template->default_job_description_keywords,
        ], fn ($value) => $value !== null);
    }
}
