<?php

namespace App\Http\Controllers;

use App\Http\Resources\JobApplicationResource;
use App\Models\JobApplication;
use App\Services\ContactService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OfferComparisonController extends Controller
{
    public function __construct(
        private ContactService $contactService,
    ) {}

    public function __invoke(Request $request): Response
    {
        $this->authorize('viewAny', JobApplication::class);

        $applications = JobApplication::query()
            ->where('user_id', $request->user()->id)
            ->where('status', 'offer')
            ->with(['activities', 'contacts'])
            ->orderBy('created_at', 'desc')
            ->get();

        $contacts = $this->contactService->listForUser($request->user());

        return Inertia::render('job-applications/offers/index', [
            'offers' => JobApplicationResource::collection($applications),
            'userDefaults' => $request->user()->tax_settings,
            'contacts' => $contacts,
        ]);
    }
}
