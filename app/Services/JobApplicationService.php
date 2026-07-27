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
        if (array_key_exists('interview_notes', $data) && $data['interview_notes'] !== $jobApplication->interview_notes) {
            $data['last_contacted_at'] = now();
        }

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

    private const array STATUS_ORDER = [
        'wishlist',
        'applied',
        'interviewing',
        'offer',
    ];

    public function updateStatusForUser(JobApplication $jobApplication, JobApplicationStatus $status, ?string $interviewDate = null): JobApplication
    {
        $this->validateStatusTransition($jobApplication->status, $status->value);

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

    public function validateStatusTransition(string $currentStatus, string $newStatus): void
    {
        // Flexible status transitions allowed across all stages.
    }

    public function markAsContacted(JobApplication $jobApplication, ?string $date = 'now'): JobApplication
    {
        $newDate = match ($date) {
            'now' => now(),
            null => null,
            default => Carbon::parse($date),
        };

        $jobApplication->update(['last_contacted_at' => $newDate]);

        $description = $newDate === null
            ? 'Contact date cleared'
            : "Marked as contacted ({$newDate->format('M j, Y')})";

        $jobApplication->activities()->create([
            'type' => 'contacted',
            'description' => $description,
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
