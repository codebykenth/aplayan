<?php

namespace App\Http\Controllers;

use App\Models\JobApplication;
use App\Services\AiCacheService;
use Illuminate\Http\JsonResponse;

class InterviewPrepController extends Controller
{
    public function __construct(private AiCacheService $aiCache) {}

    public function generate(JobApplication $jobApplication): JsonResponse
    {
        $this->authorize('update', $jobApplication);

        $result = $this->aiCache->interviewPrep(
            $jobApplication->job_description ?? '',
            $jobApplication->user_id,
        );

        if (! isset($result['_fallback'])) {
            $jobApplication->update([
                'ai_interview_prep' => $result,
            ]);
        }

        return response()->json([
            'questions' => $result['questions'] ?? [],
            'talking_points' => $result['talking_points'] ?? [],
            'tips' => $result['tips'] ?? [],
            '_badge' => $result['_badge'] ?? null,
        ]);
    }
}
