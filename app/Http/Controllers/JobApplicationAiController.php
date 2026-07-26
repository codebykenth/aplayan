<?php

namespace App\Http\Controllers;

use App\Http\Requests\AiMatchRequest;
use App\Models\JobApplication;
use App\Services\GeminiService;
use Illuminate\Http\JsonResponse;

class JobApplicationAiController extends Controller
{
    public function __construct(private GeminiService $gemini) {}

    public function analyzeMatch(AiMatchRequest $request, JobApplication $jobApplication): JsonResponse
    {
        $this->authorize('update', $jobApplication);

        $resumeText = $request->filled('resume_text')
            ? $request->input('resume_text')
            : $request->file('resume_file')->get();

        $result = $this->gemini->analyzeResumeMatch(
            $jobApplication->job_description ?? '',
            $resumeText,
        );

        $jobApplication->update([
            'ai_match_percentage' => $result['match_percentage'],
            'ai_strengths' => $result['strengths'],
            'ai_gaps' => $result['gaps'],
            'ai_evaluated_at' => now(),
        ]);

        return response()->json([
            'match_percentage' => $jobApplication->ai_match_percentage,
            'strengths' => $jobApplication->ai_strengths,
            'gaps' => $jobApplication->ai_gaps,
            'evaluated_at' => $jobApplication->ai_evaluated_at?->toIso8601String(),
        ]);
    }
}
