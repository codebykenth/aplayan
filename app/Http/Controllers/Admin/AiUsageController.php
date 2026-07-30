<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AiUsageLog;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AiUsageController extends Controller
{
    private const array FEATURE_LABELS = [
        'job_match' => 'Job Match',
        'salary_check' => 'Salary Check',
        'cover_letter' => 'Cover Letter',
        'interview_prep' => 'Interview Prep',
        'resume_polish' => 'Resume Polish',
        'cover_letter_polish' => 'Cover Letter Polish',
        'follow_up' => 'Follow-Up',
    ];

    public function __invoke(Request $request): Response
    {
        $thirtyDaysAgo = now()->subDays(30);

        $kpi = $this->aggregateKpis($thirtyDaysAgo);

        $dailyTokenUsage = $this->aggregateDailyTokenUsage($thirtyDaysAgo);

        $topFeatures = $this->aggregateTopFeatures($thirtyDaysAgo);

        $topConsumers = $this->aggregateTopConsumers($thirtyDaysAgo);

        return Inertia::render('admin/ai-usage/index', [
            'kpi' => $kpi,
            'daily_token_usage' => $dailyTokenUsage,
            'top_features' => $topFeatures,
            'top_consumers' => $topConsumers,
        ]);
    }

    private function aggregateKpis($thirtyDaysAgo): array
    {
        $callsToday = AiUsageLog::whereDate('created_at', today())->count();

        $tokenVolume30d = AiUsageLog::where('created_at', '>=', $thirtyDaysAgo)
            ->selectRaw('COALESCE(SUM(total_tokens), 0) as total_tokens')
            ->value('total_tokens');

        $estimatedCost30d = AiUsageLog::where('created_at', '>=', $thirtyDaysAgo)
            ->selectRaw('COALESCE(SUM(estimated_cost), 0) as total_cost')
            ->value('total_cost');

        $cacheHits30d = AiUsageLog::where('created_at', '>=', $thirtyDaysAgo)
            ->where('is_cache_hit', true)
            ->count();

        $cacheSavedTokens = AiUsageLog::where('created_at', '>=', $thirtyDaysAgo)
            ->where('is_cache_hit', false)
            ->selectRaw('COALESCE(AVG(total_tokens), 0) as avg_tokens')
            ->value('avg_tokens');

        return [
            'calls_today' => $callsToday,
            'token_volume_30d' => (int) $tokenVolume30d,
            'estimated_api_cost_30d' => round((float) $estimatedCost30d, 4),
            'tokens_saved_via_caching' => (int) round($cacheHits30d * (float) $cacheSavedTokens),
        ];
    }

    private function aggregateDailyTokenUsage($thirtyDaysAgo): array
    {
        return AiUsageLog::where('created_at', '>=', $thirtyDaysAgo)
            ->selectRaw('DATE(created_at) as date')
            ->selectRaw('COUNT(*) as calls')
            ->selectRaw('COALESCE(SUM(prompt_tokens), 0) as prompt_tokens')
            ->selectRaw('COALESCE(SUM(completion_tokens), 0) as completion_tokens')
            ->selectRaw('COALESCE(SUM(total_tokens), 0) as total_tokens')
            ->groupBy('date')
            ->orderBy('date', 'desc')
            ->limit(30)
            ->get()
            ->toArray();
    }

    private function aggregateTopFeatures($thirtyDaysAgo): array
    {
        $features = AiUsageLog::where('created_at', '>=', $thirtyDaysAgo)
            ->select('feature_type')
            ->selectRaw('COUNT(*) as calls')
            ->selectRaw('COALESCE(SUM(total_tokens), 0) as total_tokens')
            ->groupBy('feature_type')
            ->orderByDesc('calls')
            ->limit(10)
            ->get()
            ->keyBy('feature_type');

        return collect(self::FEATURE_LABELS)
            ->map(function (string $label, string $key) use ($features) {
                $data = $features->get($key);

                return [
                    'feature_type' => $key,
                    'label' => $label,
                    'calls' => $data ? (int) $data->calls : 0,
                    'total_tokens' => $data ? (int) $data->total_tokens : 0,
                ];
            })
            ->filter(fn ($item) => $item['calls'] > 0)
            ->values()
            ->toArray();
    }

    private function aggregateTopConsumers($thirtyDaysAgo): array
    {
        $usageStats = AiUsageLog::where('created_at', '>=', $thirtyDaysAgo)
            ->whereNotNull('user_id')
            ->select('user_id')
            ->selectRaw('COUNT(*) as total_calls')
            ->selectRaw('COALESCE(SUM(total_tokens), 0) as total_tokens')
            ->selectRaw('COALESCE(SUM(estimated_cost), 0) as estimated_cost')
            ->groupBy('user_id')
            ->orderByDesc('total_tokens')
            ->limit(20)
            ->get()
            ->keyBy('user_id');

        if ($usageStats->isEmpty()) {
            return [];
        }

        $users = User::whereIn('id', $usageStats->keys())
            ->get(['id', 'name', 'email', 'avatar', 'is_ai_disabled'])
            ->keyBy('id');

        return $usageStats->map(function ($stat) use ($users) {
            $user = $users->get($stat->user_id);

            return [
                'id' => $stat->user_id,
                'name' => $user?->name ?? 'Deleted User',
                'email' => $user?->email ?? '',
                'avatar' => $user?->avatar,
                'is_ai_disabled' => $user?->is_ai_disabled ?? false,
                'total_calls' => (int) $stat->total_calls,
                'total_tokens' => (int) $stat->total_tokens,
                'estimated_cost' => round((float) $stat->estimated_cost, 4),
            ];
        })->values()->toArray();
    }
}
