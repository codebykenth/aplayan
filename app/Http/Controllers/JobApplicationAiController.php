<?php

namespace App\Http\Controllers;

use App\Http\Requests\AiMatchRequest;
use App\Models\JobApplication;
use App\Services\AiCacheService;
use Illuminate\Http\JsonResponse;

class JobApplicationAiController extends Controller
{
    public function __construct(private AiCacheService $aiCache) {}

    public function analyzeMatch(AiMatchRequest $request, JobApplication $jobApplication): JsonResponse
    {
        $this->authorize('update', $jobApplication);

        $resumeText = $request->filled('resume_text')
            ? $request->input('resume_text')
            : $request->file('resume_file')->getContent();

        $result = $this->aiCache->resumeMatch(
            $jobApplication->company_name,
            $jobApplication->job_title,
            $jobApplication->job_description ?? '',
            $resumeText,
            $jobApplication->user_id,
        );

        if (! isset($result['_fallback'])) {
            $jobApplication->update([
                'ai_match_percentage' => $result['match_percentage'],
                'ai_strengths' => $result['strengths'],
                'ai_gaps' => $result['gaps'],
                'ai_evaluated_at' => now(),
            ]);
        }

        return response()->json([
            'match_percentage' => $result['match_percentage'],
            'strengths' => $result['strengths'],
            'gaps' => $result['gaps'],
            'evaluated_at' => now()->toIso8601String(),
            '_badge' => $result['_badge'] ?? null,
        ]);
    }
}
