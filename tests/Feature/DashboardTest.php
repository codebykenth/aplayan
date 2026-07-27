<?php

use App\Models\JobApplication;
use App\Models\User;
use Carbon\Carbon;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->otherUser = User::factory()->create();
});

it('redirects unauthenticated users to login', function () {
    $this->get(route('dashboard'))->assertRedirect();
});

it('renders the dashboard page for authenticated users', function () {
    JobApplication::factory()->count(3)->create([
        'user_id' => $this->user->id,
        'ai_match_percentage' => 75,
    ]);

    $this->actingAs($this->user)
        ->get(route('dashboard'))
        ->assertInertia(fn ($page) => $page
            ->component('dashboard')
            ->hasAll(['total', 'status_counts', 'avg_match_score', 'added_this_week', 'added_this_month', 'trend', 'recent_activities'])
        );
});

it('returns correct total application count', function () {
    JobApplication::factory()->count(5)->create(['user_id' => $this->user->id]);
    JobApplication::factory()->count(3)->create(['user_id' => $this->otherUser->id]);

    $this->actingAs($this->user)
        ->get(route('dashboard'))
        ->assertInertia(fn ($page) => $page
            ->where('total', 5)
        );
});

it('returns correct status counts', function () {
    JobApplication::factory()->create(['user_id' => $this->user->id, 'status' => 'wishlist']);
    JobApplication::factory()->create(['user_id' => $this->user->id, 'status' => 'wishlist']);
    JobApplication::factory()->create(['user_id' => $this->user->id, 'status' => 'applied']);
    JobApplication::factory()->create(['user_id' => $this->user->id, 'status' => 'interviewing']);
    JobApplication::factory()->create(['user_id' => $this->user->id, 'status' => 'offer']);
    JobApplication::factory()->create(['user_id' => $this->user->id, 'status' => 'rejected']);

    $this->actingAs($this->user)
        ->get(route('dashboard'))
        ->assertInertia(fn ($page) => $page
            ->where('status_counts.wishlist', 2)
            ->where('status_counts.applied', 1)
            ->where('status_counts.interviewing', 1)
            ->where('status_counts.offer', 1)
            ->where('status_counts.rejected', 1)
        );
});

it('calculates average match score correctly', function () {
    JobApplication::factory()->create([
        'user_id' => $this->user->id,
        'ai_match_percentage' => 50,
    ]);
    JobApplication::factory()->create([
        'user_id' => $this->user->id,
        'ai_match_percentage' => 70,
    ]);
    JobApplication::factory()->create([
        'user_id' => $this->user->id,
        'ai_match_percentage' => 90,
    ]);

    $this->actingAs($this->user)
        ->get(route('dashboard'))
        ->assertInertia(fn ($page) => $page
            ->where('avg_match_score', 70)
        );
});

it('returns null average match score when no applications have ai data', function () {
    JobApplication::factory()->create([
        'user_id' => $this->user->id,
        'ai_match_percentage' => null,
    ]);

    $this->actingAs($this->user)
        ->get(route('dashboard'))
        ->assertInertia(fn ($page) => $page
            ->where('avg_match_score', null)
        );
});

it('only counts user applications when calculating aggregates', function () {
    JobApplication::factory()->count(10)->create([
        'user_id' => $this->otherUser->id,
        'ai_match_percentage' => 100,
    ]);

    $this->actingAs($this->user)
        ->get(route('dashboard'))
        ->assertInertia(fn ($page) => $page
            ->where('total', 0)
            ->where('avg_match_score', null)
        );
});

it('counts applications added this week', function () {
    JobApplication::factory()->create([
        'user_id' => $this->user->id,
        'created_at' => now(),
    ]);
    JobApplication::factory()->create([
        'user_id' => $this->user->id,
        'created_at' => now()->subDays(8),
    ]);

    $this->actingAs($this->user)
        ->get(route('dashboard'))
        ->assertInertia(fn ($page) => $page
            ->where('added_this_week', 1)
        );
});

it('counts applications added this month', function () {
    JobApplication::factory()->create([
        'user_id' => $this->user->id,
        'created_at' => now()->startOfMonth()->addDay(),
    ]);
    JobApplication::factory()->create([
        'user_id' => $this->user->id,
        'created_at' => now()->subMonth()->subDay(),
    ]);

    $this->actingAs($this->user)
        ->get(route('dashboard'))
        ->assertInertia(fn ($page) => $page
            ->where('added_this_month', 1)
        );
});

it('returns 30-day trend data as an array with date and count', function () {
    $this->travelTo(Carbon::parse('2025-06-15'));

    JobApplication::factory()->create([
        'user_id' => $this->user->id,
        'created_at' => '2025-06-15',
    ]);
    JobApplication::factory()->create([
        'user_id' => $this->user->id,
        'created_at' => '2025-06-14',
    ]);
    JobApplication::factory()->create([
        'user_id' => $this->user->id,
        'created_at' => '2025-06-14',
    ]);

    $this->actingAs($this->user)
        ->get(route('dashboard'))
        ->assertInertia(fn ($page) => $page
            ->where('trend.0.date', '2025-05-17')
            ->where('trend.0.count', 0)
            ->where('trend.1.date', '2025-05-18')
            ->where('trend.1.count', 0)
            ->where('trend.28.date', '2025-06-14')
            ->where('trend.28.count', 2)
            ->where('trend.29.date', '2025-06-15')
            ->where('trend.29.count', 1)
            ->has('trend', 30)
        );

    $this->travelBack();
});

it('scopes data to the authenticated user when another user has applications', function () {
    JobApplication::factory()->count(3)->create([
        'user_id' => $this->otherUser->id,
    ]);

    $this->actingAs($this->user)
        ->get(route('dashboard'))
        ->assertInertia(fn ($page) => $page
            ->where('total', 0)
        );
});

it('passes recent_activities as an array', function () {
    $application = JobApplication::factory()->create([
        'user_id' => $this->user->id,
    ]);

    $application->activities()->create([
        'type' => 'note',
        'description' => 'Test note',
    ]);

    $this->actingAs($this->user)
        ->get(route('dashboard'))
        ->assertInertia(fn ($page) => $page
            ->has('recent_activities', 1)
            ->where('recent_activities.0.type', 'note')
            ->where('recent_activities.0.description', 'Test note')
            ->where('recent_activities.0.company_name', $application->company_name)
            ->where('recent_activities.0.job_title', $application->job_title)
            ->where('recent_activities.0.job_application_id', $application->id)
        );
});

it('limits recent_activities to 10 items', function () {
    $application = JobApplication::factory()->create([
        'user_id' => $this->user->id,
    ]);

    for ($i = 0; $i < 15; $i++) {
        $application->activities()->create([
            'type' => 'note',
            'description' => "Activity $i",
        ]);
    }

    $this->actingAs($this->user)
        ->get(route('dashboard'))
        ->assertInertia(fn ($page) => $page
            ->has('recent_activities', 10)
        );
});

it('scopes recent_activities to the authenticated user', function () {
    $myApplication = JobApplication::factory()->create([
        'user_id' => $this->user->id,
    ]);

    $otherApplication = JobApplication::factory()->create([
        'user_id' => $this->otherUser->id,
    ]);

    $myApplication->activities()->create([
        'type' => 'note',
        'description' => 'My activity',
    ]);

    $otherApplication->activities()->create([
        'type' => 'note',
        'description' => 'Other user activity',
    ]);

    $this->actingAs($this->user)
        ->get(route('dashboard'))
        ->assertInertia(fn ($page) => $page
            ->has('recent_activities', 1)
            ->where('recent_activities.0.description', 'My activity')
        );
});

it('orders recent_activities by most recent first', function () {
    $application = JobApplication::factory()->create([
        'user_id' => $this->user->id,
    ]);

    $old = $application->activities()->create([
        'type' => 'note',
        'description' => 'Old activity',
    ]);

    $old->forceFill(['created_at' => now()->subDays(2)])->save();

    $new = $application->activities()->create([
        'type' => 'status_update',
        'description' => 'New activity',
    ]);

    $this->actingAs($this->user)
        ->get(route('dashboard'))
        ->assertInertia(fn ($page) => $page
            ->has('recent_activities', 2)
            ->where('recent_activities.0.description', 'New activity')
            ->where('recent_activities.1.description', 'Old activity')
        );
});

it('returns empty recent_activities when user has no activities', function () {
    JobApplication::factory()->create([
        'user_id' => $this->user->id,
    ]);

    $this->actingAs($this->user)
        ->get(route('dashboard'))
        ->assertInertia(fn ($page) => $page
            ->where('recent_activities', [])
        );
});
