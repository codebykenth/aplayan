<?php

namespace App\Http\Controllers;

use App\Http\Requests\AiMatchRequest;
use App\Models\JobApplication;
use App\Services\AiCacheService;
use App\Services\AiEntityNormalizer;
use Illuminate\Http\JsonResponse;

class JobApplicationAiController extends Controller
{
    public function __construct(
        private AiCacheService $aiCache,
        private AiEntityNormalizer $normalizer,
    ) {}

    public function analyzeMatch(AiMatchRequest $request, JobApplication $jobApplication): JsonResponse
    {
        $this->authorize('update', $jobApplication);

        if (blank($jobApplication->job_description)) {
            return response()->json([
                'message' => 'Please add a Job Description to this application before running an AI match evaluation.',
            ], 422);
        }

        $resumeText = $request->filled('resume_text')
            ? $request->input('resume_text')
            : $request->file('resume_file')->getContent();

        $normalizedText = $this->normalizer->normalizeResumeText($resumeText);

        $forceRefresh = $request->boolean('force_refresh', true);

        $result = $this->aiCache->resumeMatch(
            $jobApplication->company_name,
            $jobApplication->job_title,
            $jobApplication->job_description ?? '',
            $normalizedText,
            $jobApplication->user_id,
            $forceRefresh,
        );

        $updateData = [
            'ai_resume_text' => $normalizedText,
            'ai_evaluated_at' => now(),
        ];

        if (! isset($result['_fallback'])) {
            $updateData['ai_match_percentage'] = $result['match_percentage'];
            $updateData['ai_tech_stack_percentage'] = $result['tech_stack_percentage'] ?? null;
            $updateData['ai_experience_percentage'] = $result['experience_percentage'] ?? null;
            $updateData['ai_education_percentage'] = $result['education_percentage'] ?? null;
            $updateData['ai_strengths'] = $result['strengths'];
            $updateData['ai_gaps'] = $result['gaps'];
        }

        $jobApplication->update($updateData);

        return response()->json([
            'match_percentage' => $result['match_percentage'],
            'tech_stack_percentage' => $result['tech_stack_percentage'] ?? null,
            'experience_percentage' => $result['experience_percentage'] ?? null,
            'education_percentage' => $result['education_percentage'] ?? null,
            'strengths' => $result['strengths'],
            'gaps' => $result['gaps'],
            'evaluated_at' => now()->toIso8601String(),
            '_badge' => $result['_badge'] ?? null,
            '_fallback' => $result['_fallback'] ?? false,
            '_error' => $result['_error'] ?? null,
        ]);
    }
}
