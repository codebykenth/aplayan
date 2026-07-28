<?php

namespace App\Http\Controllers;

use App\Enums\JobApplicationStatus;
use App\Http\Requests\StoreJobApplicationRequest;
use App\Http\Requests\UpdateInterviewDateRequest;
use App\Http\Requests\UpdateJobApplicationRequest;
use App\Http\Requests\UpdateJobApplicationStatusRequest;
use App\Http\Resources\JobApplicationResource;
use App\Models\JobApplication;
use App\Services\ApplicationTemplateService;
use App\Services\ContactService;
use App\Services\JobApplicationService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class JobApplicationController extends Controller
{
    public function __construct(
        private JobApplicationService $service,
        private ApplicationTemplateService $templateService,
        private ContactService $contactService,
    ) {}

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', JobApplication::class);

        $search = $request->query('search');

        $applications = $this->service->listForUser(auth()->user(), $search);
        $applications->load(['activities', 'contacts']);

        $templates = $this->templateService->listForUser(auth()->user());
        $contacts = $this->contactService->listForUser(auth()->user());

        return Inertia::render('job-applications/index', [
            'applications' => JobApplicationResource::collection($applications),
            'templates' => $templates,
            'contacts' => $contacts,
            'filters' => [
                'search' => $search,
            ],
        ]);
    }

    public function store(StoreJobApplicationRequest $request): RedirectResponse
    {
        $this->authorize('create', JobApplication::class);

        $this->service->createForUser(auth()->user(), $request->validated());

        return to_route('job-applications.index');
    }

    public function show(JobApplication $jobApplication): JobApplicationResource
    {
        $this->authorize('view', $jobApplication);

        $jobApplication->load(['activities', 'contacts']);

        return new JobApplicationResource($jobApplication);
    }

    public function update(UpdateJobApplicationRequest $request, JobApplication $jobApplication): JobApplicationResource|RedirectResponse|JsonResponse
    {
        $this->authorize('update', $jobApplication);

        $updated = $this->service->updateForUser($jobApplication, $request->validated());

        if ($request->wantsJson()) {
            return new JobApplicationResource($updated);
        }

        return back();
    }

    public function destroy(JobApplication $jobApplication): RedirectResponse
    {
        $this->authorize('delete', $jobApplication);

        $this->service->deleteForUser($jobApplication);

        return to_route('job-applications.index');
    }

    public function updateStatus(UpdateJobApplicationStatusRequest $request, JobApplication $jobApplication): RedirectResponse
    {
        $this->authorize('update', $jobApplication);

        try {
            $this->service->updateStatusForUser(
                $jobApplication,
                JobApplicationStatus::from($request->validated('status')),
                $request->validated('interview_date'),
            );
        } catch (\InvalidArgumentException $e) {
            return back()->withErrors(['status' => $e->getMessage()]);
        }

        return back();
    }

    public function updateInterviewDate(UpdateInterviewDateRequest $request, JobApplication $jobApplication): JsonResponse
    {
        $this->authorize('update', $jobApplication);

        $interviewDate = $request->validated('interview_date');

        $jobApplication->update(['interview_date' => $interviewDate ? Carbon::parse($interviewDate)->toDateTimeString() : null]);

        return response()->json([
            'data' => [
                'id' => $jobApplication->id,
                'interview_date' => $jobApplication->interview_date?->toIso8601String(),
            ],
        ]);
    }
}
