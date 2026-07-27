<?php

namespace App\Policies;

use App\Models\SavedCoverLetter;
use App\Models\User;

class SavedCoverLetterPolicy
{
    public function view(User $user, SavedCoverLetter $savedCoverLetter): bool
    {
        return $user->id === $savedCoverLetter->user_id;
    }

    public function delete(User $user, SavedCoverLetter $savedCoverLetter): bool
    {
        return $user->id === $savedCoverLetter->user_id;
    }
}
