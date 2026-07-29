<?php

namespace App\Services;

use App\Models\JobApplication;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;

class ActionFeedService
{
    public function forUser(User $user): Collection
    {
        if (app()->environment('testing')) {
            return $this->computeActionItems($user);
        }

        return collect(Cache::remember("action_feed:{$user->id}", 300, function () use ($user) {
            return $this->computeActionItems($user)->toArray();
        }));
    }

    private function computeActionItems(User $user): Collection
    {
        $applications = JobApplication::whereUserId($user->id)->get();

        $items = collect()
            ->concat($this->staleFollowUps($applications))
            ->concat($this->upcomingInterviews($applications))
            ->concat($this->highMatchWishlist($applications))
            ->concat($this->salaryNegotiations($applications))
            ->concat($this->rejectionMomentum($applications));

        return $items->sortByDesc('priority_score')->take(12)->values();
    }

    private function staleFollowUps(Collection $applications): Collection
    {
        $now = CarbonImmutable::now();

        return $applications
            ->filter(fn (JobApplication $app) => $app->status === 'applied')
            ->filter(function (JobApplication $app) use ($now) {
                $reference = $app->last_contacted_at ?? $app->created_at;

                return $reference === null || $reference->lte($now->subDays(7));
            })
            ->map(function (JobApplication $app) use ($now) {
                $reference = $app->last_contacted_at ?? $app->created_at;
                $daysSince = $reference !== null ? $reference->diffInDays($now) : 999;

                $priority = $daysSince > 14 ? 'urgent' : 'moderate';
                $priorityScore = $daysSince > 14 ? 90 : 70;
                $message = $daysSince > 14
                    ? 'This application has been stagnant for over 2 weeks. Follow up today.'
                    : 'No recent activity on this application. Consider following up.';

                return $this->buildItem(
                    type: 'stale_follow_up',
                    priority: $priority,
                    priorityScore: $priorityScore,
                    message: $message,
                    application: $app,
                );
            })
            ->values();
    }

    private function upcomingInterviews(Collection $applications): Collection
    {
        $now = CarbonImmutable::now();

        return $applications
            ->filter(fn (JobApplication $app) => $app->interview_date !== null && $app->interview_date->isFuture())
            ->map(function (JobApplication $app) use ($now) {
                $daysUntil = $now->startOfDay()->diffInDays($app->interview_date->startOfDay());

                $priority = $daysUntil <= 3 ? 'urgent' : ($daysUntil <= 7 ? 'moderate' : 'low');
                $priorityScore = $daysUntil <= 3 ? 100 : ($daysUntil <= 7 ? 80 : 60);
                $message = match (true) {
                    $daysUntil === 0 => "Interview for {$app->job_title} at {$app->company_name} is today. Prepare now.",
                    $daysUntil <= 3 => "Interview for {$app->job_title} is coming up in {$daysUntil} day".($daysUntil === 1 ? '' : 's').'. Prepare now.',
                    default => "Interview scheduled for {$app->job_title} at {$app->company_name}. Review your prep notes.",
                };

                return $this->buildItem(
                    type: 'upcoming_interview',
                    priority: $priority,
                    priorityScore: $priorityScore,
                    message: $message,
                    application: $app,
                );
            })
            ->values();
    }

    private function highMatchWishlist(Collection $applications): Collection
    {
        return $applications
            ->filter(fn (JobApplication $app) => $app->status === 'wishlist')
            ->filter(fn (JobApplication $app) => $app->ai_match_percentage !== null && $app->ai_match_percentage >= 80)
            ->map(function (JobApplication $app) {
                return $this->buildItem(
                    type: 'high_match_wishlist',
                    priority: 'moderate',
                    priorityScore: 50,
                    message: "You're a strong match ({$app->ai_match_percentage}%) for {$app->job_title} at {$app->company_name}. Consider applying.",
                    application: $app,
                );
            })
            ->values();
    }

    private function salaryNegotiations(Collection $applications): Collection
    {
        return $applications
            ->filter(fn (JobApplication $app) => $app->status === 'offer')
            ->filter(fn (JobApplication $app) => $app->offered_salary !== null)
            ->map(function (JobApplication $app) {
                $formattedSalary = '₱'.number_format($app->offered_salary);

                return $this->buildItem(
                    type: 'salary_negotiation',
                    priority: 'moderate',
                    priorityScore: 60,
                    message: "You received an offer of {$formattedSalary} from {$app->company_name}. Review salary insights and prepare your negotiation.",
                    application: $app,
                );
            })
            ->values();
    }

    private function rejectionMomentum(Collection $applications): Collection
    {
        $now = CarbonImmutable::now();
        $sevenDaysAgo = $now->subDays(7);

        $recentRejections = $applications
            ->filter(fn (JobApplication $app) => $app->status === 'rejected')
            ->filter(fn (JobApplication $app) => $app->updated_at->greaterThanOrEqualTo($sevenDaysAgo))
            ->count();

        if ($recentRejections < 3) {
            return collect();
        }

        $latestRejection = $applications
            ->filter(fn (JobApplication $app) => $app->status === 'rejected')
            ->sortByDesc('updated_at')
            ->first();

        if ($latestRejection === null) {
            return collect();
        }

        return collect([
            $this->buildItem(
                type: 'rejection_momentum',
                priority: 'low',
                priorityScore: 30,
                message: "You've received {$recentRejections} rejections in the past week. Take a moment to review your approach and refine your applications.",
                application: $latestRejection,
            ),
        ]);
    }

    private function buildItem(
        string $type,
        string $priority,
        int $priorityScore,
        string $message,
        JobApplication $application,
    ): array {
        return [
            'type' => $type,
            'priority' => $priority,
            'priority_score' => $priorityScore,
            'message' => $message,
            'application_id' => $application->id,
            'company_name' => $application->company_name,
            'job_title' => $application->job_title,
            'created_at' => $application->created_at->toIso8601String(),
        ];
    }
}
