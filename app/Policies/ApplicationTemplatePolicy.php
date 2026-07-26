<?php

namespace App\Policies;

use App\Models\ApplicationTemplate;
use App\Models\User;

class ApplicationTemplatePolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, ApplicationTemplate $template): bool
    {
        return $user->id === $template->user_id;
    }

    public function create(User $user): bool
    {
        return true;
    }

    public function update(User $user, ApplicationTemplate $template): bool
    {
        return $user->id === $template->user_id;
    }

    public function delete(User $user, ApplicationTemplate $template): bool
    {
        return $user->id === $template->user_id;
    }
}
