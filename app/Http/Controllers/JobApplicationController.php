<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreJobApplicationRequest;
use App\Http\Requests\UpdateJobApplicationRequest;
use App\Models\JobApplication;
use App\Services\JobApplicationService;
use Illuminate\Http\JsonResponse;

class JobApplicationController extends Controller
{
    public function __construct(private JobApplicationService $service) {}

    public function index(): JsonResponse
    {
        $this->authorize('viewAny', JobApplication::class);

        $applications = $this->service->listForUser(auth()->user());

        return response()->json(['data' => $applications]);
    }

    public function show(JobApplication $jobApplication): JsonResponse
    {
        $this->authorize('view', $jobApplication);

        return response()->json(['data' => $jobApplication]);
    }

    public function store(StoreJobApplicationRequest $request): JsonResponse
    {
        $this->authorize('create', JobApplication::class);

        $application = $this->service->createForUser(auth()->user(), $request->validated());

        return response()->json(['data' => $application], 201);
    }

    public function update(UpdateJobApplicationRequest $request, JobApplication $jobApplication): JsonResponse
    {
        $this->authorize('update', $jobApplication);

        $application = $this->service->updateForUser($jobApplication, $request->validated());

        return response()->json(['data' => $application]);
    }

    public function destroy(JobApplication $jobApplication): JsonResponse
    {
        $this->authorize('delete', $jobApplication);

        $this->service->deleteForUser($jobApplication);

        return response()->json(['message' => 'Deleted']);
    }
}
