<?php

namespace App\Http\Controllers;

use App\Models\LegalDocument;
use Database\Seeders\LegalDocumentSeeder;
use Inertia\Inertia;
use Inertia\Response;

class PrivacyPolicyController extends Controller
{
    public function __invoke(): Response
    {
        $document = LegalDocument::where('key', 'privacy-policy')->first();

        if (! $document) {
            (new LegalDocumentSeeder)->run();
            $document = LegalDocument::where('key', 'privacy-policy')->first();
        }

        return Inertia::render('public/privacy-policy/index', [
            'document' => $document,
        ]);
    }
}
