<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class AcceptTermsController extends Controller
{
    public function __invoke(Request $request): RedirectResponse
    {
        $user = $request->user();

        if ($user && ! $user->terms_accepted_at) {
            $user->update([
                'terms_accepted_at' => now(),
            ]);
        }

        return back()->with('status', 'Terms accepted successfully.');
    }
}
