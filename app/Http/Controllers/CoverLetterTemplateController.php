<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCoverLetterTemplateRequest;
use App\Http\Requests\UpdateCoverLetterTemplateRequest;
use App\Models\CoverLetterTemplate;
use App\Services\CoverLetterTemplateService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CoverLetterTemplateController extends Controller
{
    public function __construct(private CoverLetterTemplateService $service) {}

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', CoverLetterTemplate::class);

        $templates = $this->service->listForUser($request->user());

        return Inertia::render('templates/index', [
            'templates' => $request->user()->applicationTemplates()->latest()->get(),
            'coverLetterTemplates' => $templates,
            'activeTab' => 'cover-letter',
        ]);
    }

    public function store(StoreCoverLetterTemplateRequest $request): RedirectResponse
    {
        $this->authorize('create', CoverLetterTemplate::class);

        $this->service->createForUser($request->user(), $request->validated());

        return to_route('cover-letter-templates.index');
    }

    public function update(UpdateCoverLetterTemplateRequest $request, CoverLetterTemplate $coverLetterTemplate): RedirectResponse
    {
        $this->authorize('update', $coverLetterTemplate);

        $this->service->updateForUser($coverLetterTemplate, $request->validated());

        return to_route('cover-letter-templates.index');
    }

    public function destroy(CoverLetterTemplate $coverLetterTemplate): RedirectResponse
    {
        $this->authorize('delete', $coverLetterTemplate);

        $this->service->deleteForUser($coverLetterTemplate);

        return to_route('cover-letter-templates.index');
    }

    public function json(Request $request): JsonResponse
    {
        $templates = $this->service->listForUser($request->user());

        return response()->json(['templates' => $templates]);
    }
}
