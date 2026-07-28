<?php

namespace App\Http\Controllers;

use App\Http\Resources\JobApplicationResource;
use App\Models\JobApplication;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OfferComparisonController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $this->authorize('viewAny', JobApplication::class);

        $applications = JobApplication::query()
            ->where('user_id', $request->user()->id)
            ->where('status', 'offer')
            ->with('activities')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('job-applications/offers/index', [
            'offers' => JobApplicationResource::collection($applications),
            'userDefaults' => $request->user()->tax_settings,
        ]);
    }
}
