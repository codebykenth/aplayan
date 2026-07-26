<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreJobApplicationRequest;
use App\Http\Requests\UpdateJobApplicationRequest;
use App\Http\Resources\JobApplicationResource;
use App\Models\JobApplication;
use App\Services\JobApplicationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class JobApplicationController extends Controller
{
    public function __construct(private JobApplicationService $service) {}

    public function index(): AnonymousResourceCollection
    {
        $this->authorize('viewAny', JobApplication::class);

        $applications = $this->service->listForUser(auth()->user());

        return JobApplicationResource::collection($applications);
    }

    public function show(JobApplication $jobApplication): JobApplicationResource
    {
        $this->authorize('view', $jobApplication);

        return new JobApplicationResource($jobApplication);
    }

    public function store(StoreJobApplicationRequest $request): JobApplicationResource
    {
        $this->authorize('create', JobApplication::class);

        $application = $this->service->createForUser(auth()->user(), $request->validated());

        return new JobApplicationResource($application);
    }

    public function update(UpdateJobApplicationRequest $request, JobApplication $jobApplication): JobApplicationResource
    {
        $this->authorize('update', $jobApplication);

        $application = $this->service->updateForUser($jobApplication, $request->validated());

        return new JobApplicationResource($application);
    }

    public function destroy(JobApplication $jobApplication): JsonResponse
    {
        $this->authorize('delete', $jobApplication);

        $this->service->deleteForUser($jobApplication);

        return response()->json(['message' => 'Deleted']);
    }
}
