<?php

namespace App\Http\Controllers;

use App\Http\Requests\MarkAsContactedRequest;
use App\Models\JobApplication;
use App\Services\AiCacheService;
use App\Services\JobApplicationService;
use Illuminate\Http\JsonResponse;

class FollowUpEmailController extends Controller
{
    public function __construct(
        private AiCacheService $aiCache,
        private ?JobApplicationService $service = null,
    ) {}

    public function draft(JobApplication $jobApplication): JsonResponse
    {
        $this->authorize('view', $jobApplication);

        $daysSinceContact = $jobApplication->last_contacted_at
            ? $jobApplication->last_contacted_at->diffInDays(now())
            : ($jobApplication->updated_at
                ? $jobApplication->updated_at->diffInDays(now())
                : ($jobApplication->created_at
                    ? $jobApplication->created_at->diffInDays(now())
                    : 0));

        $draft = $this->aiCache->followUpEmail(
            $jobApplication->company_name,
            $jobApplication->job_title,
            $daysSinceContact,
            $jobApplication->status,
            $jobApplication->user_id,
        );

        return response()->json(['draft' => $draft]);
    }

    public function markAsContacted(MarkAsContactedRequest $request, JobApplication $jobApplication): JsonResponse
    {
        $this->authorize('update', $jobApplication);

        $dateParam = $request->validated('date') ?? 'now';

        $service = $this->service ?? app(JobApplicationService::class);
        $updated = $service->markAsContacted($jobApplication, $dateParam);

        return response()->json([
            'data' => [
                'id' => $updated->id,
                'last_contacted_at' => $updated->last_contacted_at?->toIso8601String(),
            ],
        ]);
    }
}
