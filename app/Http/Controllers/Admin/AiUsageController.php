<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AiResponseCache;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AiUsageController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $dailyUsage = AiResponseCache::selectRaw('DATE(created_at) as date, COUNT(*) as count')
            ->groupBy('date')
            ->orderBy('date', 'desc')
            ->limit(30)
            ->get();

        $totalCallsLast30Days = AiResponseCache::where('created_at', '>=', now()->subDays(30))->count();
        $totalCallsToday = AiResponseCache::whereDate('created_at', today())->count();

        $topFeatures = AiResponseCache::selectRaw('feature_type, COUNT(*) as count')
            ->where('created_at', '>=', now()->subDays(30))
            ->groupBy('feature_type')
            ->orderByDesc('count')
            ->limit(10)
            ->get();

        return Inertia::render('admin/ai-usage/index', [
            'daily_usage' => $dailyUsage,
            'top_features' => $topFeatures,
            'total_calls_last_30_days' => $totalCallsLast30Days,
            'total_calls_today' => $totalCallsToday,
        ]);
    }
}
