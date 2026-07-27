<?php

namespace App\Services;

use App\Enums\JobApplicationStatus;
use App\Models\JobApplication;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class JobApplicationService
{
    private const int STALE_WARNING_THRESHOLD = 7;

    private const int STALE_ALERT_THRESHOLD = 14;

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

    public function updateStatusForUser(JobApplication $jobApplication, JobApplicationStatus $status, ?string $interviewDate = null): JobApplication
    {
        $data = ['status' => $status->value];

        if ($status === JobApplicationStatus::Interviewing && $interviewDate !== null) {
            $data['interview_date'] = $interviewDate;
        }

        $jobApplication->update($data);

        $jobApplication->activities()->create([
            'type' => 'status_update',
            'description' => "Status changed to {$status->label()}",
        ]);

        return $jobApplication;
    }

    public function markAsContacted(JobApplication $jobApplication): JobApplication
    {
        $jobApplication->update(['last_contacted_at' => now()]);

        $jobApplication->activities()->create([
            'type' => 'contacted',
            'description' => 'Marked as contacted',
        ]);

        return $jobApplication;
    }

    public function stalenessLevel(JobApplication $jobApplication): ?string
    {
        if (! in_array($jobApplication->status, ['applied', 'interviewing'])) {
            return null;
        }

        $daysSinceUpdate = $this->daysSinceLastUpdate($jobApplication);

        if ($daysSinceUpdate >= self::STALE_ALERT_THRESHOLD) {
            return 'alert';
        }

        if ($daysSinceUpdate >= self::STALE_WARNING_THRESHOLD) {
            return 'warning';
        }

        return null;
    }

    public function daysSinceLastUpdate(JobApplication $jobApplication): int
    {
        $referenceDate = $jobApplication->last_contacted_at ?? $jobApplication->updated_at;

        if ($referenceDate === null) {
            return $jobApplication->created_at
                ? abs(Carbon::now()->diffInDays($jobApplication->created_at))
                : 0;
        }

        return abs(Carbon::now()->diffInDays($referenceDate));
    }
}
