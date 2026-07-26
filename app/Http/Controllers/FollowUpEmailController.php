<?php

namespace App\Http\Controllers;

use App\Models\JobApplication;
use App\Services\GeminiService;
use App\Services\JobApplicationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;
use JsonException;

class FollowUpEmailController extends Controller
{
    public function __construct(
        private GeminiService $gemini,
        private ?JobApplicationService $service = null,
    ) {}

    public function draft(JobApplication $jobApplication): JsonResponse
    {
        $this->authorize('view', $jobApplication);

        try {
            $daysSinceContact = $jobApplication->last_contacted_at
                ? $jobApplication->last_contacted_at->diffInDays(now())
                : ($jobApplication->updated_at
                    ? $jobApplication->updated_at->diffInDays(now())
                    : ($jobApplication->created_at
                        ? $jobApplication->created_at->diffInDays(now())
                        : 0));

            $draft = $this->gemini->generateFollowUpEmail(
                $jobApplication->company_name,
                $jobApplication->job_title,
                $daysSinceContact,
                $jobApplication->status,
            );
        } catch (JsonException $e) {
            return response()->json(['message' => 'Failed to generate follow-up draft.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        return response()->json(['draft' => $draft]);
    }

    public function markAsContacted(JobApplication $jobApplication): JsonResponse
    {
        $this->authorize('update', $jobApplication);

        $service = $this->service ?? app(JobApplicationService::class);
        $updated = $service->markAsContacted($jobApplication);

        return response()->json([
            'data' => [
                'id' => $updated->id,
                'last_contacted_at' => $updated->last_contacted_at?->toIso8601String(),
            ],
        ]);
    }
}
