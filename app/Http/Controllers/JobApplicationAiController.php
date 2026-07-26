<?php

namespace App\Http\Controllers;

use App\Http\Requests\AiMatchRequest;
use App\Models\JobApplication;
use App\Services\GeminiService;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use JsonException;

class JobApplicationAiController extends Controller
{
    public function __construct(private GeminiService $gemini) {}

    public function analyzeMatch(AiMatchRequest $request, JobApplication $jobApplication): JsonResponse
    {
        $this->authorize('update', $jobApplication);

        $resumeText = $request->filled('resume_text')
            ? $request->input('resume_text')
            : $request->file('resume_file')->getContent();

        try {
            $result = $this->gemini->analyzeResumeMatch(
                $jobApplication->job_description ?? '',
                $resumeText,
            );
        } catch (JsonException $e) {
            return response()->json(['message' => 'Failed to parse AI response.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        } catch (RequestException $e) {
            return response()->json(['message' => 'AI service is temporarily unavailable.'], Response::HTTP_SERVICE_UNAVAILABLE);
        }

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
