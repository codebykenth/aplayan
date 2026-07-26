<?php

namespace App\Http\Controllers;

use App\Models\JobApplication;
use App\Services\GeminiService;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use JsonException;

class InterviewPrepController extends Controller
{
    public function __construct(private GeminiService $gemini) {}

    public function generate(JobApplication $jobApplication): JsonResponse
    {
        $this->authorize('update', $jobApplication);

        try {
            $result = $this->gemini->generateInterviewPrep(
                $jobApplication->job_description ?? '',
            );
        } catch (JsonException $e) {
            return response()->json(['message' => 'Failed to parse AI response.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        } catch (RequestException $e) {
            return response()->json(['message' => 'AI service is temporarily unavailable.'], Response::HTTP_SERVICE_UNAVAILABLE);
        }

        $jobApplication->update([
            'ai_interview_prep' => $result,
        ]);

        return response()->json([
            'questions' => $result['questions'],
            'talking_points' => $result['talking_points'],
            'tips' => $result['tips'],
        ]);
    }
}
