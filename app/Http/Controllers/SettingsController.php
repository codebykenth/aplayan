<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdatePasswordRequest;
use App\Http\Requests\UpdateProfileRequest;
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
                'id', 'name', 'email', 'avatar', 'expected_salary',
                'job_search_preferences', 'theme', 'color_theme', 'tax_settings',
            ]),
        ]);
    }

    public function updateProfile(UpdateProfileRequest $request): RedirectResponse
    {
        $request->user()->update($request->validated());

        return to_route('settings.index')->with('success', 'Profile updated successfully.');
    }

    public function updateTheme(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'theme' => ['required', 'string', 'in:light,dark,system'],
        ]);

        $request->user()->update($validated);

        return to_route('settings.index')->with('success', 'Theme updated successfully.');
    }

    public function updateColorTheme(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'color_theme' => ['required', 'string', 'in:zinc,emerald,ocean,indigo,sunset'],
        ]);

        $request->user()->update($validated);

        return to_route('settings.index')->with('success', 'Color theme updated successfully.');
    }

    public function updatePassword(UpdatePasswordRequest $request): RedirectResponse
    {
        $request->user()->update([
            'password' => Hash::make($request->validated('password')),
        ]);

        return to_route('settings.index')->with('success', 'Password updated successfully.');
    }

    public function updateTaxSettings(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'tax_settings' => ['nullable', 'array'],
            'tax_settings.regime' => ['nullable', 'string', 'in:ph_regular,ph_freelance_8,tax_exempt,custom'],
            'tax_settings.allowances' => ['nullable', 'array'],
            'tax_settings.allowances.*.name' => ['required_with:tax_settings.allowances', 'string', 'max:255'],
            'tax_settings.allowances.*.amount' => ['required_with:tax_settings.allowances', 'numeric', 'min:0'],
            'tax_settings.allowances.*.taxable' => ['required_with:tax_settings.allowances', 'boolean'],
            'tax_settings.custom_deductions' => ['nullable', 'array'],
            'tax_settings.custom_deductions.*.name' => ['required_with:tax_settings.custom_deductions', 'string', 'max:255'],
            'tax_settings.custom_deductions.*.amount' => ['required_with:tax_settings.custom_deductions', 'numeric', 'min:0'],
        ]);

        $request->user()->update($validated);

        return to_route('settings.index')->with('success', 'Tax settings updated successfully.');
    }
}
