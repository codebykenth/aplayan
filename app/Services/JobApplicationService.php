<?php

namespace App\Services;

use App\Enums\JobApplicationStatus;
use App\Models\JobApplication;
use App\Models\User;
use Illuminate\Support\Collection;

class JobApplicationService
{
    public function listForUser(User $user): Collection
    {
        return $user->jobApplications()->latest()->get();
    }

    public function createForUser(User $user, array $data): JobApplication
    {
        return $user->jobApplications()->create($data);
    }

    public function updateForUser(JobApplication $jobApplication, array $data): JobApplication
    {
        $jobApplication->update($data);

        return $jobApplication;
    }

    public function deleteForUser(JobApplication $jobApplication): void
    {
        $jobApplication->delete();
    }

    public function updateStatusForUser(JobApplication $jobApplication, JobApplicationStatus $status): JobApplication
    {
        $jobApplication->update(['status' => $status->value]);

        return $jobApplication;
    }
}
