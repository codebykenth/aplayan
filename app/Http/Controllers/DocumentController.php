<?php

namespace App\Http\Controllers;

use App\Http\Requests\GenerateCoverLetterRequest;
use App\Http\Requests\UpdateResumeProfileRequest;
use App\Services\GeminiService;
use App\Services\ResumeProfileService;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class DocumentController extends Controller
{
    public function __construct(
        private ResumeProfileService $profileService,
        private GeminiService $geminiService,
    ) {}

    public function index(): Response
    {
        $profile = $this->profileService->getOrCreateProfile(auth()->user());

        return Inertia::render('documents/index', [
            'profile' => $profile,
        ]);
    }

    public function updateProfile(UpdateResumeProfileRequest $request): JsonResponse
    {
        $profile = $this->profileService->updateProfile(
            auth()->user(),
            $request->validated(),
        );

        return response()->json($profile);
    }

    public function coverLetter(GenerateCoverLetterRequest $request): JsonResponse
    {
        $profile = $request->user()->resumeProfile;

        if (! $profile) {
            return response()->json([
                'message' => 'Please complete your resume profile first.',
                'errors' => ['profile' => 'Profile is required.'],
            ], 422);
        }

        Gate::authorize('view', $profile);

        try {
            $profileText = $this->profileService->buildProfileText($profile);
            $coverLetter = $this->geminiService->generateCoverLetter(
                $profileText,
                $request->input('job_description'),
            );

            return response()->json(['cover_letter' => $coverLetter]);
        } catch (RequestException) {
            return response()->json([
                'message' => 'AI service is temporarily unavailable.',
            ], 503);
        }
    }
}
