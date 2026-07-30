<?php

namespace App\Http\Controllers;

use App\Models\LegalDocument;
use Inertia\Inertia;
use Inertia\Response;

class TermsOfServiceController extends Controller
{
    public function __invoke(): Response
    {
        $document = LegalDocument::where('key', 'terms-of-service')->first();

        return Inertia::render('public/terms-of-service/index', [
            'document' => $document,
        ]);
    }
}
