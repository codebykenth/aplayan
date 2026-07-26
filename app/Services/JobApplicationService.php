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
        $originalNotes = $jobApplication->notes;
        $jobApplication->update($data);

        if (array_key_exists('notes', $data) && $data['notes'] !== $originalNotes) {
            $jobApplication->activities()->create([
                'type' => 'note',
                'description' => 'Note updated',
            ]);
        }

        return $jobApplication;
    }

    public function deleteForUser(JobApplication $jobApplication): void
    {
        $jobApplication->delete();
    }

    public function updateStatusForUser(JobApplication $jobApplication, JobApplicationStatus $status): JobApplication
    {
        $jobApplication->update(['status' => $status->value]);

        $jobApplication->activities()->create([
            'type' => 'status_update',
            'description' => "Status changed to {$status->label()}",
        ]);

        return $jobApplication;
    }
}
