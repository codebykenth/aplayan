<?php

namespace App\Services;

use App\Models\JobApplication;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class CalendarService
{
    public function eventsForUser(User $user, string $startDate, string $endDate): Collection
    {
        $applications = $user->jobApplications()->get();

        return $this->transformToEvents($applications, $startDate, $endDate);
    }

    public function getMonthRange(int $month, int $year): array
    {
        $start = Carbon::create($year, $month, 1)->startOfMonth()->toDateString();
        $end = Carbon::create($year, $month, 1)->endOfMonth()->toDateString();

        return [$start, $end];
    }

    private function transformToEvents(Collection $applications, string $startDate, string $endDate): Collection
    {
        $events = collect();

        foreach ($applications as $app) {
            if ($app->interview_date) {
                $interviewDate = Carbon::parse($app->interview_date);
                if ($interviewDate->between($startDate, $endDate)) {
                    $events->push([
                        'id' => $app->id,
                        'type' => 'interview',
                        'date' => $interviewDate->toIso8601String(),
                        'interview_date' => $app->interview_date->toIso8601String(),
                        'date_display' => $interviewDate->toDateString(),
                        'status' => $app->status,
                        'company_name' => $app->company_name,
                        'job_title' => $app->job_title,
                        'label' => "Interview: {$app->company_name}",
                    ]);
                }
            }

            if ($app->date_applied) {
                $appliedDate = Carbon::parse($app->date_applied);
                if ($appliedDate->between($startDate, $endDate)) {
                    $events->push([
                        'id' => $app->id,
                        'type' => 'application',
                        'date' => $appliedDate->toIso8601String(),
                        'date_applied' => $app->date_applied->toIso8601String(),
                        'date_display' => $appliedDate->toDateString(),
                        'status' => $app->status,
                        'company_name' => $app->company_name,
                        'job_title' => $app->job_title,
                        'label' => "Applied: {$app->company_name}",
                    ]);
                }
            }

            $followUpDate = $this->calculateFollowUpDate($app);
            if ($followUpDate !== null) {
                $followUpCarbon = Carbon::parse($followUpDate);
                if ($followUpCarbon->between($startDate, $endDate)) {
                    $events->push([
                        'id' => $app->id,
                        'type' => 'follow_up',
                        'date' => $followUpCarbon->toIso8601String(),
                        'follow_up_date' => $followUpCarbon->toIso8601String(),
                        'date_display' => $followUpCarbon->toDateString(),
                        'status' => $app->status,
                        'company_name' => $app->company_name,
                        'job_title' => $app->job_title,
                        'label' => "Follow-up: {$app->company_name}",
                    ]);
                }
            }
        }

        return $events->sortBy('date')->values();
    }

    private function calculateFollowUpDate(JobApplication $app): ?string
    {
        if ($app->last_contacted_at !== null) {
            return Carbon::parse($app->last_contacted_at)->addDays(7)->toDateString();
        }

        if ($app->date_applied !== null) {
            return Carbon::parse($app->date_applied)->addDays(7)->toDateString();
        }

        if ($app->created_at !== null) {
            return Carbon::parse($app->created_at)->addDays(7)->toDateString();
        }

        return null;
    }
}