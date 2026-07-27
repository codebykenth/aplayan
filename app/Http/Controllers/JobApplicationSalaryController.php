<?php

namespace App\Http\Controllers;

use App\Models\JobApplication;
use App\Services\AiCacheService;
use Illuminate\Http\JsonResponse;

class JobApplicationSalaryController extends Controller
{
    public function __construct(private AiCacheService $aiCache) {}

    public function checkSalary(JobApplication $jobApplication): JsonResponse
    {
        $this->authorize('update', $jobApplication);

        $result = $this->aiCache->salaryCheck(
            $jobApplication->job_title,
            $jobApplication->location,
            $jobApplication->job_description,
            $jobApplication->user_id,
        );

        if (! isset($result['_fallback'])) {
            $jobApplication->update([
                'ai_salary_min' => $result['min_salary_php'],
                'ai_salary_max' => $result['max_salary_php'],
                'ai_salary_notes' => $result['market_context'],
                'ai_evaluated_at' => now(),
            ]);
        }

        return response()->json([
            'salary_min' => $result['min_salary_php'] ?? null,
            'salary_max' => $result['max_salary_php'] ?? null,
            'salary_notes' => $result['market_context'] ?? null,
            'evaluated_at' => now()->toIso8601String(),
            '_badge' => $result['_badge'] ?? null,
        ]);
    }
}
