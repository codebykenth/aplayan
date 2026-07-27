<?php

namespace App\Services;

use App\Models\User;

class GoalService
{
    public function weeklyProgress(User $user): int
    {
        return $user->jobApplications()
            ->where('created_at', '>=', now()->startOfWeek())
            ->count();
    }

    public function weeklyHistory(User $user): array
    {
        $dates = $user->jobApplications()
            ->where('created_at', '>=', now()->subWeeks(3)->startOfWeek())
            ->pluck('created_at');

        $history = [];

        for ($i = 3; $i >= 0; $i--) {
            $weekStart = now()->subWeeks($i)->startOfWeek();
            $weekEnd = $weekStart->copy()->endOfWeek();

            $count = $dates->filter(fn ($date) => $date >= $weekStart && $date <= $weekEnd
            )->count();

            $history[] = [
                'label' => $weekStart->format('M d'),
                'count' => $count,
                'start_date' => $weekStart->format('Y-m-d'),
                'end_date' => $weekEnd->format('Y-m-d'),
                'is_current' => $i === 0,
            ];
        }

        return $history;
    }

    public function fourWeekAverage(User $user): float
    {
        $history = $this->weeklyHistory($user);
        $counts = collect($history)->pluck('count');

        if ($counts->sum() === 0) {
            return 0;
        }

        return round($counts->avg(), 1);
    }

    public function currentStreak(User $user): int
    {
        $dates = $user->jobApplications()
            ->where('created_at', '>=', now()->subWeeks(7)->startOfWeek())
            ->pluck('created_at');

        $goal = $user->weekly_goal ?? 10;
        $streak = 0;

        for ($i = 0; $i < 8; $i++) {
            $weekStart = now()->subWeeks($i)->startOfWeek();
            $weekEnd = $weekStart->copy()->endOfWeek();

            $count = $dates->filter(fn ($date) => $date >= $weekStart && $date <= $weekEnd
            )->count();

            if ($count >= $goal) {
                $streak++;
            } else {
                break;
            }
        }

        return $streak;
    }

    public function forUser(User $user): array
    {
        return [
            'weekly_goal' => $user->weekly_goal,
            'current_streak' => $this->currentStreak($user),
            'weekly_progress' => $this->weeklyProgress($user),
            'four_week_average' => $this->fourWeekAverage($user),
            'weekly_history' => $this->weeklyHistory($user),
        ];
    }
}
