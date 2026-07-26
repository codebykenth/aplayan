<?php

namespace App\Http\Controllers;

use App\Models\JobApplication;
use App\Services\GeminiService;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use JsonException;

class JobApplicationSalaryController extends Controller
{
    public function __construct(private GeminiService $gemini) {}

    public function checkSalary(JobApplication $jobApplication): JsonResponse
    {
        $this->authorize('update', $jobApplication);

        try {
            $result = $this->gemini->estimateSalary(
                $jobApplication->job_title,
                $jobApplication->location,
                $jobApplication->job_description,
            );
        } catch (JsonException $e) {
            return response()->json(['message' => 'Failed to parse AI response.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        } catch (RequestException $e) {
            return response()->json(['message' => 'AI service is temporarily unavailable.'], Response::HTTP_SERVICE_UNAVAILABLE);
        }

        $jobApplication->update([
            'ai_salary_min' => $result['min_salary_php'],
            'ai_salary_max' => $result['max_salary_php'],
            'ai_salary_notes' => $result['market_context'],
            'ai_evaluated_at' => now(),
        ]);

        return response()->json([
            'salary_min' => $jobApplication->ai_salary_min,
            'salary_max' => $jobApplication->ai_salary_max,
            'salary_notes' => $jobApplication->ai_salary_notes,
            'evaluated_at' => $jobApplication->ai_evaluated_at?->toIso8601String(),
        ]);
    }
}
