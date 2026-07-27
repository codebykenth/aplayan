<?php

namespace App\Policies;

use App\Models\ResumeProfile;
use App\Models\User;

class ResumeProfilePolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, ResumeProfile $resumeProfile): bool
    {
        return $user->id === $resumeProfile->user_id;
    }

    public function update(User $user, ResumeProfile $resumeProfile): bool
    {
        return $user->id === $resumeProfile->user_id;
    }

    public function delete(User $user, ResumeProfile $resumeProfile): bool
    {
        return $user->id === $resumeProfile->user_id;
    }
}
