<?php

namespace App\Http\Controllers;

use App\Http\Requests\JobApplicationImportRequest;
use App\Models\JobApplication;
use App\Services\JobApplicationImportService;
use Illuminate\Http\RedirectResponse;

class JobApplicationImportController extends Controller
{
    public function __construct(
        private JobApplicationImportService $importService,
    ) {}

    public function __invoke(JobApplicationImportRequest $request): RedirectResponse
    {
        $this->authorize('create', JobApplication::class);

        $result = $this->importService->import($request->user(), $request->file('file'));

        return to_route('job-applications.index')
            ->with('status', "Imported {$result['imported']} application(s). {$result['skipped']} row(s) skipped.");
    }
}
