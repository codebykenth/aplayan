<?php

use App\Models\JobApplication;
use App\Models\User;
use App\Services\AnalyticsService;
use App\Services\FxExchangeService;

beforeEach(function () {
    $this->user = User::factory()->create();
});

it('stores a job application with currency', function () {
    $data = JobApplication::factory()->make(['user_id' => $this->user->id])->toArray();
    $data['currency'] = 'USD';

    $response = $this->actingAs($this->user)->post(route('job-applications.store'), $data);

    $response->assertRedirect(route('job-applications.index'));
    $this->assertDatabaseHas('job_applications', [
        'company_name' => $data['company_name'],
        'user_id' => $this->user->id,
        'currency' => 'USD',
    ]);
});

it('stores a job application with default PHP currency', function () {
    $data = JobApplication::factory()->make(['user_id' => $this->user->id])->toArray();
    unset($data['currency']);

    $response = $this->actingAs($this->user)->post(route('job-applications.store'), $data);

    $response->assertRedirect(route('job-applications.index'));
    $this->assertDatabaseHas('job_applications', [
        'company_name' => $data['company_name'],
        'user_id' => $this->user->id,
        'currency' => 'PHP',
    ]);
});

it('validates currency is a valid ISO code', function () {
    $data = JobApplication::factory()->make(['user_id' => $this->user->id])->toArray();
    $data['currency'] = 'INVALID';

    $response = $this->actingAs($this->user)->postJson(route('job-applications.store'), $data);

    $response->assertJsonValidationErrors(['currency']);
});

it('accepts all supported currencies', function () {
    $supportedCurrencies = ['PHP', 'USD', 'EUR', 'GBP', 'AUD', 'CAD', 'SGD', 'JPY', 'AED', 'NZD'];

    foreach ($supportedCurrencies as $currency) {
        $data = JobApplication::factory()->make(['user_id' => $this->user->id])->toArray();
        $data['currency'] = $currency;

        $response = $this->actingAs($this->user)->postJson(route('job-applications.store'), $data);

        $response->assertRedirect(route('job-applications.index'));
        $this->assertDatabaseHas('job_applications', [
            'company_name' => $data['company_name'],
            'currency' => $currency,
        ]);
    }
});

it('updates a job application currency', function () {
    $application = JobApplication::factory()->create(['user_id' => $this->user->id, 'currency' => 'PHP']);

    $response = $this->actingAs($this->user)->putJson(
        route('job-applications.update', $application),
        [
            'company_name' => $application->company_name,
            'job_title' => $application->job_title,
            'location' => $application->location,
            'status' => $application->status,
            'currency' => 'USD',
        ],
    );

    $response->assertSuccessful();
    $this->assertDatabaseHas('job_applications', [
        'id' => $application->id,
        'currency' => 'USD',
    ]);
});

it('returns currency in the resource response', function () {
    $application = JobApplication::factory()->create([
        'user_id' => $this->user->id,
        'currency' => 'USD',
    ]);

    $response = $this->actingAs($this->user)->getJson(route('job-applications.show', $application));

    $response->assertSuccessful();
    expect($response->json('data.currency'))->toBe('USD');
});

it('includes currency in the resource keys', function () {
    $application = JobApplication::factory()->create(['user_id' => $this->user->id]);

    $response = $this->actingAs($this->user)->getJson(route('job-applications.show', $application));

    $response->assertSuccessful();
    expect($response->json('data'))->toHaveKey('currency');
});

describe('FxExchangeService', function () {
    it('returns valid exchange rates for PHP base', function () {
        $service = new FxExchangeService;
        $rates = $service->getRates('PHP');

        expect($rates)->toBeArray();
        expect($rates)->toHaveKey('USD');
        expect($rates['USD'])->toBeFloat();
        expect($rates['USD'])->toBeGreaterThan(0);
    });

    it('returns valid exchange rates for USD base', function () {
        $service = new FxExchangeService;
        $rates = $service->getRates('USD');

        expect($rates)->toBeArray();
        expect($rates)->toHaveKey('PHP');
        expect($rates['PHP'])->toBeFloat();
        expect($rates['PHP'])->toBeGreaterThan(0);
    });

    it('converts amount between currencies', function () {
        $service = new FxExchangeService;
        $converted = $service->convert(1000, 'USD', 'PHP');

        expect($converted)->toBeFloat();
        expect($converted)->toBeGreaterThan(0);
    });

    it('returns same amount when converting same currency', function () {
        $service = new FxExchangeService;
        $converted = $service->convert(1000, 'USD', 'USD');

        expect($converted)->toBe(1000.0);
    });

    it('converts to PHP correctly', function () {
        $service = new FxExchangeService;
        $converted = $service->convertToPhp(1000, 'USD');

        expect($converted)->toBeFloat();
        expect($converted)->toBeGreaterThan(0);
    });

    it('returns supported currencies list', function () {
        $service = new FxExchangeService;
        $currencies = $service->getSupportedCurrencies();

        expect($currencies)->toBeArray();
        expect($currencies)->toContain('PHP');
        expect($currencies)->toContain('USD');
        expect($currencies)->toContain('EUR');
    });

    it('returns correct currency symbols', function () {
        $service = new FxExchangeService;

        expect($service->getCurrencySymbol('PHP'))->toBe('₱');
        expect($service->getCurrencySymbol('USD'))->toBe('$');
        expect($service->getCurrencySymbol('EUR'))->toBe('€');
        expect($service->getCurrencySymbol('GBP'))->toBe('£');
        expect($service->getCurrencySymbol('AUD'))->toBe('A$');
    });
});

describe('Analytics Currency Normalization', function () {
    it('normalizes salary insights across currencies', function () {
        JobApplication::factory()->create([
            'user_id' => $this->user->id,
            'expected_salary' => 100000,
            'currency' => 'PHP',
        ]);

        JobApplication::factory()->create([
            'user_id' => $this->user->id,
            'expected_salary' => 2000,
            'currency' => 'USD',
        ]);

        $analyticsService = app(AnalyticsService::class);
        $insights = $analyticsService->salaryInsights($this->user, 'PHP');

        expect($insights['avg_expected'])->toBeNumeric();
        expect($insights['base_currency'])->toBe('PHP');
    });

    it('normalizes salary bands across currencies', function () {
        JobApplication::factory()->create([
            'user_id' => $this->user->id,
            'expected_salary' => 50000,
            'currency' => 'PHP',
        ]);

        JobApplication::factory()->create([
            'user_id' => $this->user->id,
            'expected_salary' => 3000,
            'currency' => 'USD',
        ]);

        $analyticsService = app(AnalyticsService::class);
        $bands = $analyticsService->salaryBands($this->user, 'PHP');

        expect($bands)->toBeCollection();
        $totalExpected = $bands->sum('expected');
        expect($totalExpected)->toBeGreaterThanOrEqual(2);
    });
});
