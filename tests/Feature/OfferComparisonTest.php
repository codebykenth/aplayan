<?php

use App\Models\JobApplication;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->otherUser = User::factory()->create();
});

it('redirects unauthenticated users to login', function () {
    $this->get(route('job-applications.offers'))->assertRedirect();
});

it('shows only offer status applications for the authenticated user', function () {
    $offerApp = JobApplication::factory()->create([
        'user_id' => $this->user->id,
        'status' => 'offer',
        'offered_salary' => 60_000,
    ]);

    JobApplication::factory()->create([
        'user_id' => $this->user->id,
        'status' => 'applied',
    ]);

    JobApplication::factory()->create([
        'user_id' => $this->user->id,
        'status' => 'interviewing',
    ]);

    $response = $this->actingAs($this->user)->get(route('job-applications.offers'));

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page
        ->component('job-applications/offers/index')
        ->has('offers.data', 1)
        ->where('offers.data.0.id', $offerApp->id)
    );
});

it('shows empty state when user has no offers', function () {
    JobApplication::factory()->create([
        'user_id' => $this->user->id,
        'status' => 'applied',
    ]);

    $response = $this->actingAs($this->user)->get(route('job-applications.offers'));

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page
        ->component('job-applications/offers/index')
        ->has('offers.data', 0)
    );
});

it('does not show other users offers', function () {
    JobApplication::factory()->count(2)->create([
        'user_id' => $this->otherUser->id,
        'status' => 'offer',
    ]);

    $response = $this->actingAs($this->user)->get(route('job-applications.offers'));

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page
        ->component('job-applications/offers/index')
        ->has('offers.data', 0)
    );
});

it('includes tax breakdown in offer data', function () {
    $app = JobApplication::factory()->create([
        'user_id' => $this->user->id,
        'status' => 'offer',
        'offered_salary' => 50_000,
    ]);

    $response = $this->actingAs($this->user)->get(route('job-applications.offers'));

    $response->assertInertia(fn ($page) => $page
        ->component('job-applications/offers/index')
        ->has('offers.data', 1)
    );

    $pageProps = $response->inertiaPage()['props'];
    $offerData = $pageProps['offers']['data'][0] ?? [];
    $taxBreakdown = $offerData['tax_breakdown'] ?? null;

    expect($taxBreakdown)->not->toBeNull();
    expect($taxBreakdown)->toHaveKeys([
        'monthly_gross', 'sss', 'philhealth', 'pagibig', 'bir_tax',
        'total_deductions', 'monthly_net', 'thirteenth_month',
        'annual_gross', 'annual_net',
    ]);
    expect($taxBreakdown['sss'])->toBeGreaterThan(0);
    expect($taxBreakdown['monthly_net'])->toBeGreaterThan(0);
});

it('shows multiple offers sorted by most recent', function () {
    $oldOffer = JobApplication::factory()->create([
        'user_id' => $this->user->id,
        'status' => 'offer',
        'company_name' => 'Old Corp',
        'created_at' => now()->subDays(5),
    ]);

    $newOffer = JobApplication::factory()->create([
        'user_id' => $this->user->id,
        'status' => 'offer',
        'company_name' => 'New Corp',
        'created_at' => now(),
    ]);

    $response = $this->actingAs($this->user)->get(route('job-applications.offers'));

    $response->assertInertia(fn ($page) => $page
        ->component('job-applications/offers/index')
        ->has('offers.data', 2)
        ->where('offers.data.0.id', $newOffer->id)
        ->where('offers.data.1.id', $oldOffer->id)
    );
});
