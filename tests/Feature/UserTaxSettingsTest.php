<?php

use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
});

it('redirects unauthenticated users to login for tax settings update', function () {
    $this->patch(route('settings.tax.update'), [])->assertRedirect();
});

it('updates user tax settings', function () {
    $taxSettings = [
        'regime' => 'ph_freelance_8',
        'allowances' => [
            ['name' => 'Rice Allowance', 'amount' => 2500, 'taxable' => false],
        ],
        'custom_deductions' => [
            ['name' => 'HMO Dependent', 'amount' => 1200],
        ],
    ];

    $response = $this->actingAs($this->user)->patchJson(route('settings.tax.update'), [
        'tax_settings' => $taxSettings,
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('users', [
        'id' => $this->user->id,
        'tax_settings' => json_encode($taxSettings),
    ]);
});

it('includes tax_settings in settings page props', function () {
    $this->user->update([
        'tax_settings' => [
            'regime' => 'tax_exempt',
        ],
    ]);

    $response = $this->actingAs($this->user)->get(route('settings.index'));

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page
        ->component('settings/index')
        ->where('user.tax_settings.regime', 'tax_exempt')
    );
});

it('validates tax_settings regime enum', function () {
    $response = $this->actingAs($this->user)->patchJson(route('settings.tax.update'), [
        'tax_settings' => ['regime' => 'invalid'],
    ]);

    $response->assertJsonValidationErrors(['tax_settings.regime']);
});

it('validates tax_settings allowance amount is numeric', function () {
    $response = $this->actingAs($this->user)->patchJson(route('settings.tax.update'), [
        'tax_settings' => [
            'allowances' => [
                ['name' => 'Test', 'amount' => 'not_a_number', 'taxable' => true],
            ],
        ],
    ]);

    $response->assertJsonValidationErrors(['tax_settings.allowances.0.amount']);
});

it('validates tax_settings custom deduction amount is numeric', function () {
    $response = $this->actingAs($this->user)->patchJson(route('settings.tax.update'), [
        'tax_settings' => [
            'custom_deductions' => [
                ['name' => 'Test', 'amount' => -500],
            ],
        ],
    ]);

    $response->assertJsonValidationErrors(['tax_settings.custom_deductions.0.amount']);
});

it('allows null tax_settings', function () {
    $this->user->update(['tax_settings' => ['regime' => 'ph_regular']]);

    $response = $this->actingAs($this->user)->patchJson(route('settings.tax.update'), [
        'tax_settings' => null,
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('users', [
        'id' => $this->user->id,
        'tax_settings' => null,
    ]);
});
