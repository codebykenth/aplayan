<?php

namespace App\Services;

use App\Enums\JobApplicationStatus;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class AnalyticsService
{
    public function funnel(User $user): Collection
    {
        $counts = $user->jobApplications()
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status');

        $order = collect(JobApplicationStatus::cases());

        return $order->map(fn (JobApplicationStatus $status) => [
            'name' => $status->label(),
            'value' => (int) ($counts[$status->value] ?? 0),
        ]);
    }

    public function weeklyVolume(User $user): Collection
    {
        $weeks = collect();
        for ($i = 11; $i >= 0; $i--) {
            $start = now()->subWeeks($i)->startOfWeek()->format('Y-m-d');
            $weeks[$start] = 0;
        }

        $counts = $user->jobApplications()
            ->where('created_at', '>=', now()->subWeeks(11)->startOfWeek())
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as count'))
            ->groupBy('date')
            ->pluck('count', 'date');

        foreach ($counts as $date => $count) {
            $weekStart = Carbon::parse($date)->startOfWeek()->format('Y-m-d');
            if (isset($weeks[$weekStart])) {
                $weeks[$weekStart] += (int) $count;
            }
        }

        return $weeks->map(fn (int $count, string $week) => [
            'week' => $week,
            'count' => $count,
        ])->values();
    }

    public function statusOverTime(User $user): Collection
    {
        $statuses = collect(JobApplicationStatus::cases())->pluck('value');

        $weekRows = [];
        for ($i = 11; $i >= 0; $i--) {
            $start = now()->subWeeks($i)->startOfWeek()->format('Y-m-d');
            $row = ['week' => $start];
            foreach ($statuses as $status) {
                $row[$status] = 0;
            }
            $weekRows[$start] = $row;
        }

        $rows = $user->jobApplications()
            ->where('created_at', '>=', now()->subWeeks(11)->startOfWeek())
            ->select('status', DB::raw('DATE(created_at) as date'))
            ->get();

        foreach ($rows as $row) {
            $weekStart = Carbon::parse($row->date)->startOfWeek()->format('Y-m-d');
            if (isset($weekRows[$weekStart])) {
                $weekRows[$weekStart][$row->status]++;
            }
        }

        return collect(array_values($weekRows));
    }

    public function salaryInsights(User $user): array
    {
        $expected = $user->jobApplications()
            ->whereNotNull('expected_salary')
            ->avg('expected_salary');

        $offered = $user->jobApplications()
            ->whereNotNull('offered_salary')
            ->avg('offered_salary');

        return [
            'avg_expected' => $expected !== null ? round((float) $expected) : null,
            'avg_offered' => $offered !== null ? round((float) $offered) : null,
        ];
    }

    public function salaryBands(User $user): Collection
    {
        $bands = [
            ['label' => '₱0–30k', 'min' => 0, 'max' => 30_000],
            ['label' => '₱30–60k', 'min' => 30_001, 'max' => 60_000],
            ['label' => '₱60–90k', 'min' => 60_001, 'max' => 90_000],
            ['label' => '₱90–120k', 'min' => 90_001, 'max' => 120_000],
            ['label' => '₱120k+', 'min' => 120_001, 'max' => PHP_INT_MAX],
        ];

        $expectedCounts = $user->jobApplications()
            ->whereNotNull('expected_salary')
            ->select('expected_salary')
            ->get()
            ->groupBy(fn ($app) => $this->bandLabel($bands, $app->expected_salary))
            ->map->count();

        $offeredCounts = $user->jobApplications()
            ->whereNotNull('offered_salary')
            ->select('offered_salary')
            ->get()
            ->groupBy(fn ($app) => $this->bandLabel($bands, $app->offered_salary))
            ->map->count();

        return collect($bands)->map(fn (array $band) => [
            'band' => $band['label'],
            'expected' => $expectedCounts[$band['label']] ?? 0,
            'offered' => $offeredCounts[$band['label']] ?? 0,
        ]);
    }

    public function timeToResponse(User $user): Collection
    {
        return $user->jobApplications()
            ->whereNotNull('date_applied')
            ->whereHas('activities', fn ($q) => $q->where('type', 'status_update'))
            ->with(['activities' => fn ($q) => $q->where('type', 'status_update')->oldest()])
            ->get()
            ->map(function ($application) {
                $firstActivity = $application->activities->first();
                if ($firstActivity === null) {
                    return null;
                }

                $appliedDate = Carbon::parse($application->date_applied);
                $responseDate = $firstActivity->created_at;
                $days = $appliedDate->diffInDays($responseDate);

                return [
                    'company' => $application->company_name,
                    'job_title' => $application->job_title,
                    'days' => $days,
                ];
            })
            ->filter()
            ->values();
    }

    private function bandLabel(array $bands, int $salary): string
    {
        foreach ($bands as $band) {
            if ($salary >= $band['min'] && $salary <= $band['max']) {
                return $band['label'];
            }
        }

        return '₱120k+';
    }
}
