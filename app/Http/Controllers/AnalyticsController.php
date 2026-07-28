<?php

namespace App\Http\Controllers;

use App\Services\AnalyticsService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AnalyticsController extends Controller
{
    public function __construct(
        private AnalyticsService $analytics,
    ) {}

    public function __invoke(Request $request): Response
    {
        $user = $request->user();
        $baseCurrency = $user->base_currency ?? 'PHP';

        return Inertia::render('analytics/index', [
            'funnel' => $this->analytics->funnel($user),
            'weekly_volume' => $this->analytics->weeklyVolume($user),
            'status_over_time' => $this->analytics->statusOverTime($user),
            'salary_insights' => $this->analytics->salaryInsights($user, $baseCurrency),
            'salary_bands' => $this->analytics->salaryBands($user, $baseCurrency),
            'time_to_response' => $this->analytics->timeToResponse($user),
        ]);
    }
}
