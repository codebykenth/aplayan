<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreApplicationTemplateRequest;
use App\Http\Requests\UpdateApplicationTemplateRequest;
use App\Models\ApplicationTemplate;
use App\Services\ApplicationTemplateService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ApplicationTemplateController extends Controller
{
    public function __construct(private ApplicationTemplateService $service) {}

    public function index(Request $request): Response
    {
        $this->authorize('viewAny', ApplicationTemplate::class);

        $templates = $this->service->listForUser($request->user());

        return Inertia::render('templates/index', [
            'templates' => $templates,
        ]);
    }

    public function store(StoreApplicationTemplateRequest $request): RedirectResponse
    {
        $this->authorize('create', ApplicationTemplate::class);

        $this->service->createForUser($request->user(), $request->validated());

        return to_route('templates.index');
    }

    public function update(UpdateApplicationTemplateRequest $request, ApplicationTemplate $applicationTemplate): RedirectResponse
    {
        $this->authorize('update', $applicationTemplate);

        $this->service->updateForUser($applicationTemplate, $request->validated());

        return to_route('templates.index');
    }

    public function destroy(ApplicationTemplate $applicationTemplate): RedirectResponse
    {
        $this->authorize('delete', $applicationTemplate);

        $this->service->deleteForUser($applicationTemplate);

        return to_route('templates.index');
    }
}
