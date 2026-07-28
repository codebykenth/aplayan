<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateColorThemeRequest;
use App\Http\Requests\UpdatePasswordRequest;
use App\Http\Requests\UpdateProfileRequest;
use App\Http\Requests\UpdateTaxSettingsRequest;
use App\Http\Requests\UpdateThemeRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class SettingsController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('settings/index', [
            'user' => $request->user()->fresh()->only([
                'id', 'name', 'email', 'avatar', 'expected_salary', 'base_currency',
                'job_search_preferences', 'theme', 'color_theme', 'tax_settings',
            ]),
        ]);
    }

    public function updateProfile(UpdateProfileRequest $request): RedirectResponse
    {
        $request->user()->update($request->validated());

        return to_route('settings.index')->with('success', 'Profile updated successfully.');
    }

    public function updateTheme(UpdateThemeRequest $request): RedirectResponse
    {
        $request->user()->update($request->validated());

        return to_route('settings.index')->with('success', 'Theme updated successfully.');
    }

    public function updateColorTheme(UpdateColorThemeRequest $request): RedirectResponse
    {
        $request->user()->update($request->validated());

        return to_route('settings.index')->with('success', 'Color theme updated successfully.');
    }

    public function updatePassword(UpdatePasswordRequest $request): RedirectResponse
    {
        $request->user()->update([
            'password' => Hash::make($request->validated('password')),
        ]);

        return to_route('settings.index')->with('success', 'Password updated successfully.');
    }

    public function updateTaxSettings(UpdateTaxSettingsRequest $request): RedirectResponse
    {
        $request->user()->update($request->validated());

        return to_route('settings.index')->with('success', 'Tax settings updated successfully.');
    }
}
