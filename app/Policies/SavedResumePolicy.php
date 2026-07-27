<?php

namespace App\Policies;

use App\Models\SavedResume;
use App\Models\User;

class SavedResumePolicy
{
    public function view(User $user, SavedResume $savedResume): bool
    {
        return $user->id === $savedResume->user_id;
    }

    public function delete(User $user, SavedResume $savedResume): bool
    {
        return $user->id === $savedResume->user_id;
    }
}
