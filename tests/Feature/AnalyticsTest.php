<?php

use App\Enums\JobApplicationStatus;
use App\Models\JobApplication;
use App\Models\User;
use Carbon\Carbon;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->otherUser = User::factory()->create();
});

it('redirects unauthenticated users to login', function () {
    $this->get(route('analytics'))->assertRedirect();
});

it('renders the analytics page for authenticated users', function () {
    $this->actingAs($this->user)
        ->get(route('analytics'))
        ->assertInertia(fn ($page) => $page
            ->component('analytics/index')
            ->hasAll(['funnel', 'weekly_volume', 'status_over_time', 'salary_insights', 'salary_bands', 'time_to_response'])
        );
});

it('returns correct funnel data', function () {
    JobApplication::factory()->create(['user_id' => $this->user->id, 'status' => 'wishlist']);
    JobApplication::factory()->create(['user_id' => $this->user->id, 'status' => 'wishlist']);
    JobApplication::factory()->create(['user_id' => $this->user->id, 'status' => 'applied']);
    JobApplication::factory()->create(['user_id' => $this->user->id, 'status' => 'interviewing']);
    JobApplication::factory()->create(['user_id' => $this->user->id, 'status' => 'offer']);

    $response = $this->actingAs($this->user)
        ->get(route('analytics'));

    $response->assertSuccessful();
    $response->assertInertia(fn ($page) => $page
        ->component('analytics/index')
        ->where('funnel.0.name', JobApplicationStatus::Wishlist->label())
        ->where('funnel.0.value', 2)
        ->where('funnel.1.name', JobApplicationStatus::Applied->label())
        ->where('funnel.1.value', 1)
        ->where('funnel.2.name', JobApplicationStatus::Interviewing->label())
        ->where('funnel.2.value', 1)
        ->where('funnel.3.name', JobApplicationStatus::Offer->label())
        ->where('funnel.3.value', 1)
    );
});

it('funnel excludes rejected status', function () {
    JobApplication::factory()->create(['user_id' => $this->user->id, 'status' => 'rejected']);

    $this->actingAs($this->user)
        ->get(route('analytics'))
        ->assertInertia(fn ($page) => $page
            ->where('funnel', fn ($funnel) => collect($funnel)->pluck('name')->doesntContain(JobApplicationStatus::Rejected->label()))
        );
});

it('scopes analytics data to the authenticated user', function () {
    JobApplication::factory()->count(5)->create(['user_id' => $this->otherUser->id]);
    JobApplication::factory()->count(3)->create(['user_id' => $this->user->id, 'status' => 'applied']);

    $this->actingAs($this->user)
        ->get(route('analytics'))
        ->assertInertia(fn ($page) => $page
            ->where('funnel.0.value', 0)
            ->where('funnel.1.value', 3)
        );
});

it('returns weekly volume data for the last 12 weeks', function () {
    $this->travelTo(Carbon::parse('2025-07-01'));

    $weekAgo = now()->subWeek()->startOfWeek()->addDay();
    JobApplication::factory()->create([
        'user_id' => $this->user->id,
        'created_at' => $weekAgo,
    ]);

    $response = $this->actingAs($this->user)->get(route('analytics'));

    $response->assertInertia(fn ($page) => $page
        ->has('weekly_volume', 12)
        ->where('weekly_volume.10.count', 1)
    );

    $this->travelBack();
});

it('returns status over time for the last 12 weeks', function () {
    $this->travelTo(Carbon::parse('2025-07-01'));

    JobApplication::factory()->create([
        'user_id' => $this->user->id,
        'status' => 'applied',
        'created_at' => now()->subWeeks(3)->startOfWeek()->addDay(),
    ]);

    $response = $this->actingAs($this->user)->get(route('analytics'));

    $response->assertInertia(fn ($page) => $page
        ->has('status_over_time', 12)
    );

    $this->travelBack();
});

it('returns salary insights correctly', function () {
    JobApplication::factory()->create([
        'user_id' => $this->user->id,
        'expected_salary' => 40_000,
        'offered_salary' => 45_000,
    ]);
    JobApplication::factory()->create([
        'user_id' => $this->user->id,
        'expected_salary' => 60_000,
        'offered_salary' => 55_000,
    ]);

    $this->actingAs($this->user)
        ->get(route('analytics'))
        ->assertInertia(fn ($page) => $page
            ->where('salary_insights.avg_expected', 50_000)
            ->where('salary_insights.avg_offered', 50_000)
        );
});

it('returns null salary insights when no salary data exists', function () {
    JobApplication::factory()->create([
        'user_id' => $this->user->id,
        'expected_salary' => null,
        'offered_salary' => null,
    ]);

    $this->actingAs($this->user)
        ->get(route('analytics'))
        ->assertInertia(fn ($page) => $page
            ->where('salary_insights.avg_expected', null)
            ->where('salary_insights.avg_offered', null)
        );
});

it('returns salary band distribution', function () {
    JobApplication::factory()->create([
        'user_id' => $this->user->id,
        'expected_salary' => 25_000,
        'offered_salary' => null,
    ]);
    JobApplication::factory()->create([
        'user_id' => $this->user->id,
        'expected_salary' => 50_000,
        'offered_salary' => 55_000,
    ]);
    JobApplication::factory()->create([
        'user_id' => $this->user->id,
        'expected_salary' => null,
        'offered_salary' => 80_000,
    ]);

    $this->actingAs($this->user)
        ->get(route('analytics'))
        ->assertInertia(fn ($page) => $page
            ->where('salary_bands.0.band', '₱0–30k')
            ->where('salary_bands.0.expected', 1)
            ->where('salary_bands.0.offered', 0)
            ->where('salary_bands.1.band', '₱30–60k')
            ->where('salary_bands.1.expected', 1)
            ->where('salary_bands.1.offered', 1)
            ->where('salary_bands.2.band', '₱60–90k')
            ->where('salary_bands.2.expected', 0)
            ->where('salary_bands.2.offered', 1)
        );
});

it('returns time to response data', function () {
    $appliedDate = '2025-06-01';
    $responseDate = '2025-06-10';

    $application = JobApplication::factory()->create([
        'user_id' => $this->user->id,
        'status' => 'interviewing',
        'date_applied' => $appliedDate,
    ]);

    DB::table('job_application_activities')->insert([
        'job_application_id' => $application->id,
        'type' => 'status_update',
        'description' => 'Status changed to Applied',
        'created_at' => $responseDate,
        'updated_at' => $responseDate,
    ]);

    $this->actingAs($this->user)
        ->get(route('analytics'))
        ->assertInertia(fn ($page) => $page
            ->has('time_to_response', 1)
            ->where('time_to_response.0.company', $application->company_name)
            ->where('time_to_response.0.days', 9)
        );
});

it('returns empty time to response when no activities exist', function () {
    JobApplication::factory()->create([
        'user_id' => $this->user->id,
        'date_applied' => '2025-06-01',
    ]);

    $this->actingAs($this->user)
        ->get(route('analytics'))
        ->assertInertia(fn ($page) => $page
            ->where('time_to_response', [])
        );
});

it('returns empty data for all metrics when user has no applications', function () {
    $this->actingAs($this->user)
        ->get(route('analytics'))
        ->assertInertia(fn ($page) => $page
            ->where('funnel', fn ($funnel) => collect($funnel)->every(fn ($item) => $item['value'] === 0))
            ->where('weekly_volume', fn ($vol) => collect($vol)->every(fn ($item) => $item['count'] === 0))
            ->where('salary_insights.avg_expected', null)
            ->where('salary_insights.avg_offered', null)
            ->where('time_to_response', [])
        );
});
