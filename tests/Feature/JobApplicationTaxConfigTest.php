<?php

use App\Models\JobApplication;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
});

it('updates job application with tax_config via PATCH', function () {
    $application = JobApplication::factory()->create(['user_id' => $this->user->id]);

    $taxConfig = [
        'regime' => 'ph_regular',
        'allowances' => [
            ['name' => 'Rice Allowance', 'amount' => 2000, 'taxable' => false],
        ],
        'custom_deductions' => [
            ['name' => 'HMO', 'amount' => 1500],
        ],
    ];

    $response = $this->actingAs($this->user)->patchJson(
        route('job-applications.update', $application),
        [
            'company_name' => $application->company_name,
            'job_title' => $application->job_title,
            'location' => $application->location,
            'status' => $application->status,
            'tax_config' => $taxConfig,
        ],
    );

    $response->assertSuccessful();
    $this->assertDatabaseHas('job_applications', [
        'id' => $application->id,
        'tax_config' => json_encode($taxConfig),
    ]);
});

it('updates tax_config with statutory overrides via PATCH', function () {
    $application = JobApplication::factory()->create(['user_id' => $this->user->id]);

    $taxConfig = [
        'regime' => 'ph_regular',
        'override_sss' => 5000,
        'override_philhealth' => 3000,
        'override_pagibig' => 2000,
        'override_bir_tax' => 15000,
    ];

    $response = $this->actingAs($this->user)->patchJson(
        route('job-applications.update', $application),
        [
            'company_name' => $application->company_name,
            'job_title' => $application->job_title,
            'location' => $application->location,
            'status' => $application->status,
            'tax_config' => $taxConfig,
        ],
    );

    $response->assertSuccessful();
    $app = $application->fresh();
    expect($app->tax_config['override_sss'])->toBe(5000);
    expect($app->tax_config['override_philhealth'])->toBe(3000);
    expect($app->tax_config['override_pagibig'])->toBe(2000);
    expect($app->tax_config['override_bir_tax'])->toBe(15000);
});

it('updates tax_config with manual_net_override via PATCH', function () {
    $application = JobApplication::factory()->create(['user_id' => $this->user->id]);

    $taxConfig = [
        'regime' => 'tax_exempt',
        'manual_net_override' => 45000,
    ];

    $response = $this->actingAs($this->user)->patchJson(
        route('job-applications.update', $application),
        [
            'company_name' => $application->company_name,
            'job_title' => $application->job_title,
            'location' => $application->location,
            'status' => $application->status,
            'tax_config' => $taxConfig,
        ],
    );

    $response->assertSuccessful();
    $app = $application->fresh();
    expect($app->tax_config['manual_net_override'])->toBe(45000);
});

it('validates tax_config monetary amounts are non-negative', function () {
    $application = JobApplication::factory()->create(['user_id' => $this->user->id]);

    $response = $this->actingAs($this->user)->patchJson(
        route('job-applications.update', $application),
        [
            'company_name' => $application->company_name,
            'job_title' => $application->job_title,
            'location' => $application->location,
            'status' => $application->status,
            'tax_config' => [
                'manual_net_override' => -1000,
            ],
        ],
    );

    $response->assertJsonValidationErrors(['tax_config.manual_net_override']);
});

it('validates tax_config override amounts are non-negative', function () {
    $application = JobApplication::factory()->create(['user_id' => $this->user->id]);

    $response = $this->actingAs($this->user)->patchJson(
        route('job-applications.update', $application),
        [
            'company_name' => $application->company_name,
            'job_title' => $application->job_title,
            'location' => $application->location,
            'status' => $application->status,
            'tax_config' => [
                'override_sss' => -500,
            ],
        ],
    );

    $response->assertJsonValidationErrors(['tax_config.override_sss']);
});

it('validates tax_config allowance amounts are non-negative', function () {
    $application = JobApplication::factory()->create(['user_id' => $this->user->id]);

    $response = $this->actingAs($this->user)->patchJson(
        route('job-applications.update', $application),
        [
            'company_name' => $application->company_name,
            'job_title' => $application->job_title,
            'location' => $application->location,
            'status' => $application->status,
            'tax_config' => [
                'allowances' => [
                    ['name' => 'Test', 'amount' => -100, 'taxable' => true],
                ],
            ],
        ],
    );

    $response->assertJsonValidationErrors(['tax_config.allowances.0.amount']);
});

it('validates tax_config custom_deduction amounts are non-negative', function () {
    $application = JobApplication::factory()->create(['user_id' => $this->user->id]);

    $response = $this->actingAs($this->user)->patchJson(
        route('job-applications.update', $application),
        [
            'company_name' => $application->company_name,
            'job_title' => $application->job_title,
            'location' => $application->location,
            'status' => $application->status,
            'tax_config' => [
                'custom_deductions' => [
                    ['name' => 'Test', 'amount' => -50],
                ],
            ],
        ],
    );

    $response->assertJsonValidationErrors(['tax_config.custom_deductions.0.amount']);
});

it('validates tax_config regime is a valid enum', function () {
    $application = JobApplication::factory()->create(['user_id' => $this->user->id]);

    $response = $this->actingAs($this->user)->patchJson(
        route('job-applications.update', $application),
        [
            'company_name' => $application->company_name,
            'job_title' => $application->job_title,
            'location' => $application->location,
            'status' => $application->status,
            'tax_config' => [
                'regime' => 'invalid_regime',
            ],
        ],
    );

    $response->assertJsonValidationErrors(['tax_config.regime']);
});

it('can update both application fields and tax_config simultaneously', function () {
    $application = JobApplication::factory()->create(['user_id' => $this->user->id]);

    $response = $this->actingAs($this->user)->patchJson(
        route('job-applications.update', $application),
        [
            'company_name' => 'Updated Corp',
            'job_title' => 'Senior Engineer',
            'location' => 'Manila',
            'status' => 'offer',
            'offered_salary' => 80000,
            'tax_config' => [
                'regime' => 'ph_regular',
                'manual_net_override' => 55000,
            ],
        ],
    );

    $response->assertSuccessful();
    $this->assertDatabaseHas('job_applications', [
        'id' => $application->id,
        'company_name' => 'Updated Corp',
        'job_title' => 'Senior Engineer',
        'status' => 'offer',
        'offered_salary' => 80000,
    ]);

    $app = $application->fresh();
    expect($app->tax_config['regime'])->toBe('ph_regular');
    expect($app->tax_config['manual_net_override'])->toBe(55000);
});

it('authorizes user before updating job application with tax_config', function () {
    $application = JobApplication::factory()->create(['user_id' => User::factory()->create()->id]);

    $response = $this->actingAs($this->user)->patchJson(
        route('job-applications.update', $application),
        [
            'company_name' => 'Hacked',
            'job_title' => 'Engineer',
            'location' => 'Remote',
            'status' => 'applied',
            'tax_config' => ['regime' => 'ph_regular'],
        ],
    );

    $response->assertForbidden();
});
