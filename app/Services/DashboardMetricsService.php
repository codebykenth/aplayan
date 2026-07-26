<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class DashboardMetricsService
{
    public function totalForUser(User $user): int
    {
        return $user->jobApplications()->count();
    }

    public function statusCountsForUser(User $user): array
    {
        return $user->jobApplications()
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();
    }

    public function avgMatchScoreForUser(User $user): ?int
    {
        $avg = $user->jobApplications()
            ->whereNotNull('ai_match_percentage')
            ->avg('ai_match_percentage');

        return $avg !== null ? round((float) $avg) : null;
    }

    public function addedThisWeekForUser(User $user): int
    {
        return $user->jobApplications()
            ->where('created_at', '>=', now()->startOfWeek())
            ->count();
    }

    public function addedThisMonthForUser(User $user): int
    {
        return $user->jobApplications()
            ->where('created_at', '>=', now()->startOfMonth())
            ->count();
    }

    public function trendForUser(User $user): Collection
    {
        $trendData = $user->jobApplications()
            ->where('created_at', '>=', now()->subDays(29)->startOfDay())
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as count'))
            ->groupBy('date')
            ->orderBy('date')
            ->pluck('count', 'date');

        $trend = collect();
        for ($i = 29; $i >= 0; $i--) {
            $date = now()->subDays($i)->format('Y-m-d');
            $trend->push([
                'date' => $date,
                'count' => (int) ($trendData[$date] ?? 0),
            ]);
        }

        return $trend;
    }
}
