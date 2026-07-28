<?php

namespace App\Services;

use App\Enums\JobApplicationStatus;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class AnalyticsService
{
    public function __construct(
        private readonly FxExchangeService $fxService,
    ) {}

    public function funnel(User $user): Collection
    {
        return collect(Cache::remember("analytics:funnel:{$user->id}", 600, function () use ($user) {
            $counts = $user->jobApplications()
                ->select('status', DB::raw('count(*) as count'))
                ->groupBy('status')
                ->pluck('count', 'status');

            $order = collect(JobApplicationStatus::cases())
                ->reject(fn (JobApplicationStatus $status) => $status === JobApplicationStatus::Rejected);

            return $order->map(fn (JobApplicationStatus $status) => [
                'name' => $status->label(),
                'value' => (int) ($counts[$status->value] ?? 0),
            ])->values()->toArray();
        }));
    }

    public function weeklyVolume(User $user): Collection
    {
        return collect(Cache::remember("analytics:weekly_volume:{$user->id}", 600, function () use ($user) {
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
            ])->values()->toArray();
        }));
    }

    public function statusOverTime(User $user): Collection
    {
        return collect(Cache::remember("analytics:status_over_time:{$user->id}", 600, function () use ($user) {
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

            return array_values($weekRows);
        }));
    }

    public function salaryInsights(User $user, string $baseCurrency = 'PHP'): array
    {
        return Cache::remember("analytics:salary_insights:{$user->id}", 600, function () use ($user, $baseCurrency) {
            $applications = $user->jobApplications()
                ->where(function ($query) {
                    $query->whereNotNull('expected_salary')
                        ->orWhereNotNull('offered_salary');
                })
                ->get(['expected_salary', 'offered_salary', 'currency']);

            $expectedTotal = 0;
            $expectedCount = 0;
            $offeredTotal = 0;
            $offeredCount = 0;

            foreach ($applications as $app) {
                $currency = $app->currency ?? 'PHP';

                if ($app->expected_salary !== null) {
                    $expectedTotal += $this->fxService->convert($app->expected_salary, $currency, $baseCurrency);
                    $expectedCount++;
                }

                if ($app->offered_salary !== null) {
                    $offeredTotal += $this->fxService->convert($app->offered_salary, $currency, $baseCurrency);
                    $offeredCount++;
                }
            }

            return [
                'avg_expected' => $expectedCount > 0 ? round($expectedTotal / $expectedCount) : null,
                'avg_offered' => $offeredCount > 0 ? round($offeredTotal / $offeredCount) : null,
                'base_currency' => $baseCurrency,
            ];
        });
    }

    public function salaryBands(User $user, string $baseCurrency = 'PHP'): Collection
    {
        return collect(Cache::remember("analytics:salary_bands:{$user->id}", 600, function () use ($user, $baseCurrency) {
            $symbol = $this->fxService->getCurrencySymbol($baseCurrency);

            $bands = [
                ['label' => "{$symbol}0–30k", 'min' => 0, 'max' => 30_000],
                ['label' => "{$symbol}30–60k", 'min' => 30_001, 'max' => 60_000],
                ['label' => "{$symbol}60–90k", 'min' => 60_001, 'max' => 90_000],
                ['label' => "{$symbol}90–120k", 'min' => 90_001, 'max' => 120_000],
                ['label' => "{$symbol}120k+", 'min' => 120_001, 'max' => PHP_INT_MAX],
            ];

            $applications = $user->jobApplications()
                ->where(function ($query) {
                    $query->whereNotNull('expected_salary')
                        ->orWhereNotNull('offered_salary');
                })
                ->get(['expected_salary', 'offered_salary', 'currency']);

            $expectedCounts = collect();
            $offeredCounts = collect();

            foreach ($applications as $app) {
                $currency = $app->currency ?? 'PHP';

                if ($app->expected_salary !== null) {
                    $converted = $this->fxService->convert($app->expected_salary, $currency, $baseCurrency);
                    $label = $this->bandLabel($bands, (int) $converted);
                    $expectedCounts[$label] = ($expectedCounts[$label] ?? 0) + 1;
                }

                if ($app->offered_salary !== null) {
                    $converted = $this->fxService->convert($app->offered_salary, $currency, $baseCurrency);
                    $label = $this->bandLabel($bands, (int) $converted);
                    $offeredCounts[$label] = ($offeredCounts[$label] ?? 0) + 1;
                }
            }

            return collect($bands)->map(fn (array $band) => [
                'band' => $band['label'],
                'expected' => $expectedCounts[$band['label']] ?? 0,
                'offered' => $offeredCounts[$band['label']] ?? 0,
            ])->toArray();
        }));
    }

    public function timeToResponse(User $user): Collection
    {
        return collect(Cache::remember("analytics:time_to_response:{$user->id}", 600, function () use ($user) {
            return $user->jobApplications()
                ->whereNotNull('date_applied')
                ->where(function ($query) {
                    $query->whereNotNull('last_contacted_at')
                        ->orWhereHas('activities', fn ($q) => $q->where('type', 'status_update'));
                })
                ->with(['activities' => fn ($q) => $q->whereIn('type', ['status_update', 'contacted'])->oldest()])
                ->get()
                ->map(function ($application) {
                    $responseActivity = $application->activities
                        ->first(fn ($act) => ! str_contains($act->description, 'Status changed to Applied') && ! str_contains($act->description, 'Status changed to Wishlist'))
                        ?? $application->activities->first();

                    if ($responseActivity === null && $application->last_contacted_at === null) {
                        return null;
                    }

                    $appliedDate = Carbon::parse($application->date_applied);
                    $firstResponseDate = $responseActivity ? $responseActivity->created_at : $application->last_contacted_at;
                    $firstResponseDays = (int) $appliedDate->diffInDays($firstResponseDate);

                    $lastContactDays = null;
                    $lastContactDate = null;

                    if ($application->last_contacted_at !== null) {
                        $lastContactDays = (int) $appliedDate->diffInDays(Carbon::parse($application->last_contacted_at));
                        $lastContactDate = Carbon::parse($application->last_contacted_at)->format('M j, Y');
                    }

                    return [
                        'company' => $application->company_name,
                        'job_title' => $application->job_title,
                        'days' => $firstResponseDays,
                        'applied_date' => $appliedDate->format('M j, Y'),
                        'first_response_date' => Carbon::parse($firstResponseDate)->format('M j, Y'),
                        'last_contact_date' => $lastContactDate,
                        'last_contact_days' => $lastContactDays,
                    ];
                })
                ->filter()
                ->values()
                ->toArray();
        }));
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
