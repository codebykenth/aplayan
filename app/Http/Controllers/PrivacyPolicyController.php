<?php

namespace App\Http\Controllers;

use App\Models\LegalDocument;
use Inertia\Inertia;
use Inertia\Response;

class PrivacyPolicyController extends Controller
{
    public function __invoke(): Response
    {
        $document = LegalDocument::where('key', 'privacy-policy')->first();

        return Inertia::render('public/privacy-policy/index', [
            'document' => $document,
        ]);
    }
}
