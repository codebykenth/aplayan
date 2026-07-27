<?php

namespace App\Services;

use App\Models\JobApplicationActivity;
use App\Models\User;
use Illuminate\Support\Collection;

class ActivityService
{
    public function recentForUser(User $user, int $limit = 10): Collection
    {
        return JobApplicationActivity::whereHas('jobApplication', fn ($q) => $q->where('user_id', $user->id))
            ->with('jobApplication')
            ->latest()
            ->limit($limit)
            ->get()
            ->map(fn (JobApplicationActivity $activity) => [
                'id' => $activity->id,
                'type' => $activity->type,
                'description' => $activity->description,
                'created_at' => $activity->created_at?->toIso8601String(),
                'company_name' => $activity->jobApplication->company_name,
                'job_title' => $activity->jobApplication->job_title,
                'job_application_id' => $activity->jobApplication->id,
            ]);
    }
}
