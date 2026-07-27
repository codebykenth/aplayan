<?php

namespace App\Http\Controllers;

use App\Http\Requests\AiImproveCoverLetterRequest;
use App\Http\Requests\AiPolishResumeRequest;
use App\Http\Requests\GenerateCoverLetterRequest;
use App\Http\Requests\SaveCoverLetterRequest;
use App\Http\Requests\UpdateResumeProfileRequest;
use App\Models\SavedCoverLetter;
use App\Models\SavedResume;
use App\Models\User;
use App\Services\GeminiService;
use App\Services\ResumeProfileService;
use Illuminate\Http\Client\RequestException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Inertia\Inertia;
use Inertia\Response;

class DocumentController extends Controller
{
    public function __construct(
        private ResumeProfileService $profileService,
        private GeminiService $geminiService,
    ) {}

    public function index(Request $request): Response
    {
        $user = auth()->user();
        $profile = $this->profileService->getOrCreateProfile($user);
        $aiLimit = $this->getAiRateLimitInfo($user);

        $loadedResume = null;
        if ($request->has('load_resume')) {
            $loadedResume = $user->savedResumes()->find($request->input('load_resume'));
        }

        $loadedCoverLetter = null;
        if ($request->has('load_cover_letter')) {
            $loadedCoverLetter = $user->savedCoverLetters()->find($request->input('load_cover_letter'));
        }

        return Inertia::render('documents/index', [
            'profile' => $profile,
            'aiLimit' => $aiLimit,
            'loadedResume' => $loadedResume,
            'loadedCoverLetter' => $loadedCoverLetter,
        ]);
    }

    public function updateProfile(UpdateResumeProfileRequest $request): RedirectResponse
    {
        $this->profileService->updateProfile(
            auth()->user(),
            $request->validated(),
        );

        return to_route('documents.index')->with('success', 'Resume profile saved successfully.');
    }

    public function coverLetter(GenerateCoverLetterRequest $request): JsonResponse
    {
        $user = $request->user();
        $profile = $user->resumeProfile;

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

    public function aiPolishResume(AiPolishResumeRequest $request): JsonResponse
    {
        try {
            $polished = $this->geminiService->polishResumeSection(
                $request->input('section'),
                $request->input('content'),
                $request->input('context', ''),
            );

            return response()->json(['polished' => $polished]);
        } catch (RequestException) {
            return response()->json([
                'message' => 'AI service is temporarily unavailable.',
            ], 503);
        }
    }

    public function aiImproveCoverLetter(AiImproveCoverLetterRequest $request): JsonResponse
    {
        try {
            $improved = $this->geminiService->improveCoverLetter(
                $request->input('content'),
                $request->input('preset'),
            );

            return response()->json(['improved' => $improved]);
        } catch (RequestException) {
            return response()->json([
                'message' => 'AI service is temporarily unavailable.',
            ], 503);
        }
    }

    public function saved(): Response
    {
        $user = auth()->user();
        $resumes = $user->savedResumes()->latest()->get();
        $coverLetters = $user->savedCoverLetters()->latest()->get();

        return Inertia::render('documents/saved', [
            'resumes' => $resumes,
            'coverLetters' => $coverLetters,
        ]);
    }

    public function saveResume(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'template' => ['required', 'string', 'in:clean,modern,philippine,ats_classic,ats_executive,ats_bullet'],
            'profile_data' => ['required', 'array'],
            'photo_url' => ['nullable', 'string', 'max:500'],
        ]);

        $request->user()->savedResumes()->create($validated);

        return to_route('documents.saved')->with('success', 'Resume version saved.');
    }

    public function saveCoverLetter(SaveCoverLetterRequest $request): JsonResponse
    {
        $coverLetter = $request->user()->savedCoverLetters()->create(
            $request->validated(),
        );

        return response()->json([
            'message' => 'Cover letter saved.',
            'cover_letter' => $coverLetter,
        ]);
    }

    public function savedCoverLettersJson(): JsonResponse
    {
        $coverLetters = auth()->user()->savedCoverLetters()
            ->latest()
            ->take(20)
            ->get()
            ->map(fn ($letter) => [
                'id' => $letter->id,
                'content' => $letter->content,
                'target_company' => $letter->target_company,
                'target_job_title' => $letter->target_job_title,
                'created_at' => $letter->created_at->diffForHumans(),
            ]);

        return response()->json(['coverLetters' => $coverLetters]);
    }

    public function destroyResumeVersion(SavedResume $savedResume): RedirectResponse
    {
        Gate::authorize('delete', $savedResume);
        $savedResume->delete();

        return to_route('documents.saved')->with('success', 'Resume version deleted.');
    }

    public function destroyCoverLetter(SavedCoverLetter $savedCoverLetter): RedirectResponse
    {
        Gate::authorize('delete', $savedCoverLetter);
        $savedCoverLetter->delete();

        return to_route('documents.saved')->with('success', 'Cover letter deleted.');
    }

    private function getAiRateLimitInfo(?User $user): array
    {
        if (! $user) {
            return ['remaining' => 0, 'total' => 20, 'exhausted' => true];
        }

        $key = 'ai:'.$user->id;

        $remaining = RateLimiter::remaining($key, 20);

        return [
            'remaining' => $remaining,
            'total' => 20,
            'exhausted' => $remaining <= 0,
        ];
    }
}
