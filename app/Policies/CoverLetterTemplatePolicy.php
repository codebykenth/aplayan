<?php

namespace App\Policies;

use App\Models\CoverLetterTemplate;
use App\Models\User;

class CoverLetterTemplatePolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, CoverLetterTemplate $template): bool
    {
        return $user->id === $template->user_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, CoverLetterTemplate $template): bool
    {
        return $user->id === $template->user_id;
    }

    public function delete(User $user, CoverLetterTemplate $template): bool
    {
        return $user->id === $template->user_id;
    }
}
