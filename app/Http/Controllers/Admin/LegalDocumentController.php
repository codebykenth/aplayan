<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateLegalDocumentRequest;
use App\Models\LegalDocument;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class LegalDocumentController extends Controller
{
    public function index(): Response
    {
        $documents = LegalDocument::orderBy('key')->get();

        return Inertia::render('admin/legal/index', [
            'documents' => $documents,
        ]);
    }

    public function update(UpdateLegalDocumentRequest $request, LegalDocument $legalDocument): RedirectResponse
    {
        $legalDocument->update([
            'title' => $request->validated()['title'],
            'content' => $request->validated()['content'],
            'version' => $legalDocument->version + 1,
        ]);

        return back()->with('status', 'Legal document updated successfully.');
    }
}
