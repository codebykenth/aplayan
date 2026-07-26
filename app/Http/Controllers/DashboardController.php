<?php

namespace App\Http\Controllers;

use App\Services\DashboardMetricsService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __construct(private DashboardMetricsService $metrics) {}

    public function __invoke(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('dashboard', [
            'total' => $this->metrics->totalForUser($user),
            'status_counts' => $this->metrics->statusCountsForUser($user),
            'avg_match_score' => $this->metrics->avgMatchScoreForUser($user),
            'added_this_week' => $this->metrics->addedThisWeekForUser($user),
            'added_this_month' => $this->metrics->addedThisMonthForUser($user),
            'trend' => $this->metrics->trendForUser($user),
        ]);
    }
}
