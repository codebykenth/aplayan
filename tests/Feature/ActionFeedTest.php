<?php

use App\Models\JobApplication;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->actingAs($this->user);
});

it('flags stale follow-ups for applications not contacted in over 7 days', function () {
    JobApplication::factory()->create([
        'user_id' => $this->user->id,
        'status' => 'applied',
        'last_contacted_at' => now()->subDays(8),
        'ai_evaluated_at' => now(),
    ]);

    $this->get(route('dashboard'))
        ->assertInertia(fn ($page) => $page
            ->has('action_items', 1)
            ->where('action_items.0.type', 'stale_follow_up')
        );
});

it('does not flag applications contacted within 7 days as stale', function () {
    JobApplication::factory()->create([
        'user_id' => $this->user->id,
        'status' => 'applied',
        'last_contacted_at' => now()->subDays(2),
        'ai_evaluated_at' => now(),
    ]);

    $this->get(route('dashboard'))
        ->assertInertia(fn ($page) => $page
            ->where('action_items', [])
        );
});

it('flags stale follow-ups when last_contacted_at is null and created_at is old', function () {
    JobApplication::factory()->create([
        'user_id' => $this->user->id,
        'status' => 'applied',
        'last_contacted_at' => null,
        'created_at' => now()->subDays(10),
        'ai_evaluated_at' => now(),
    ]);

    $this->get(route('dashboard'))
        ->assertInertia(fn ($page) => $page
            ->has('action_items', 1)
            ->where('action_items.0.type', 'stale_follow_up')
        );
});

it('marks stale follow-ups as urgent when stagnant over 14 days', function () {
    JobApplication::factory()->create([
        'user_id' => $this->user->id,
        'status' => 'applied',
        'last_contacted_at' => now()->subDays(15),
        'ai_evaluated_at' => now(),
    ]);

    $this->get(route('dashboard'))
        ->assertInertia(fn ($page) => $page
            ->where('action_items.0.priority', 'urgent')
        );
});

it('flags upcoming interviews', function () {
    JobApplication::factory()->create([
        'user_id' => $this->user->id,
        'status' => 'applied',
        'interview_date' => now()->addDays(2),
        'ai_evaluated_at' => now(),
        'last_contacted_at' => now(),
    ]);

    $this->get(route('dashboard'))
        ->assertInertia(fn ($page) => $page
            ->has('action_items', 1)
            ->where('action_items.0.type', 'upcoming_interview')
        );
});

it('does not flag past interviews', function () {
    JobApplication::factory()->create([
        'user_id' => $this->user->id,
        'status' => 'applied',
        'interview_date' => now()->subDays(1),
        'ai_evaluated_at' => now(),
        'last_contacted_at' => now(),
    ]);

    $this->get(route('dashboard'))
        ->assertInertia(fn ($page) => $page
            ->where('action_items', [])
        );
});

it('flags high-match wishlist items', function () {
    JobApplication::factory()->create([
        'user_id' => $this->user->id,
        'status' => 'wishlist',
        'ai_match_percentage' => 85,
        'ai_evaluated_at' => now(),
    ]);

    $this->get(route('dashboard'))
        ->assertInertia(fn ($page) => $page
            ->has('action_items', 1)
            ->where('action_items.0.type', 'high_match_wishlist')
        );
});

it('does not flag low-match wishlist items', function () {
    JobApplication::factory()->create([
        'user_id' => $this->user->id,
        'status' => 'wishlist',
        'ai_match_percentage' => 50,
        'ai_evaluated_at' => now(),
    ]);

    $this->get(route('dashboard'))
        ->assertInertia(fn ($page) => $page
            ->where('action_items', [])
        );
});

it('flags salary negotiation opportunities for offers', function () {
    JobApplication::factory()->create([
        'user_id' => $this->user->id,
        'status' => 'offer',
        'offered_salary' => 75000,
    ]);

    $this->get(route('dashboard'))
        ->assertInertia(fn ($page) => $page
            ->has('action_items', 1)
            ->where('action_items.0.type', 'salary_negotiation')
        );
});

it('flags rejection momentum when 3 or more rejections in the past week', function () {
    JobApplication::factory()->count(3)->create([
        'user_id' => $this->user->id,
        'status' => 'rejected',
        'updated_at' => now()->subDays(2),
    ]);

    $this->get(route('dashboard'))
        ->assertInertia(fn ($page) => $page
            ->has('action_items', 1)
            ->where('action_items.0.type', 'rejection_momentum')
        );
});

it('does not flag rejection momentum with fewer than 3 rejections', function () {
    JobApplication::factory()->count(2)->create([
        'user_id' => $this->user->id,
        'status' => 'rejected',
        'updated_at' => now()->subDays(2),
    ]);

    $this->get(route('dashboard'))
        ->assertInertia(fn ($page) => $page
            ->where('action_items', [])
        );
});

it('does not flag rejection momentum when rejections are old', function () {
    JobApplication::factory()->count(3)->create([
        'user_id' => $this->user->id,
        'status' => 'rejected',
        'updated_at' => now()->subDays(10),
    ]);

    $this->get(route('dashboard'))
        ->assertInertia(fn ($page) => $page
            ->where('action_items', [])
        );
});

it('scopes action items to the authenticated user', function () {
    $otherUser = User::factory()->create();

    JobApplication::factory()->create([
        'user_id' => $otherUser->id,
        'status' => 'applied',
        'last_contacted_at' => now()->subDays(10),
    ]);

    $this->get(route('dashboard'))
        ->assertInertia(fn ($page) => $page
            ->where('action_items', [])
        );
});

it('prioritizes urgent upcoming interviews over stale follow-ups', function () {
    JobApplication::factory()->create([
        'user_id' => $this->user->id,
        'status' => 'applied',
        'last_contacted_at' => now()->subDays(15),
        'ai_evaluated_at' => now(),
    ]);

    JobApplication::factory()->create([
        'user_id' => $this->user->id,
        'status' => 'applied',
        'interview_date' => now()->addDays(1),
        'ai_evaluated_at' => now(),
        'last_contacted_at' => now(),
    ]);

    $this->get(route('dashboard'))
        ->assertInertia(fn ($page) => $page
            ->has('action_items', 2)
            ->where('action_items.0.type', 'upcoming_interview')
            ->where('action_items.1.type', 'stale_follow_up')
        );
});

it('returns action_items as a prop on the dashboard page', function () {
    $this->get(route('dashboard'))
        ->assertInertia(fn ($page) => $page
            ->component('dashboard')
            ->has('action_items')
        );
});

it('returns empty action_items array when no action items needed', function () {
    JobApplication::factory()->create([
        'user_id' => $this->user->id,
        'status' => 'applied',
        'last_contacted_at' => now(),
        'ai_evaluated_at' => now(),
    ]);

    $this->get(route('dashboard'))
        ->assertInertia(fn ($page) => $page
            ->where('action_items', [])
        );
});

it('clears stale follow-up after marking as contacted', function () {
    $application = JobApplication::factory()->create([
        'user_id' => $this->user->id,
        'status' => 'applied',
        'last_contacted_at' => now()->subDays(10),
        'ai_evaluated_at' => now(),
    ]);

    $this->get(route('dashboard'))
        ->assertInertia(fn ($page) => $page
            ->has('action_items', 1)
        );

    $application->update(['last_contacted_at' => now()]);

    $this->get(route('dashboard'))
        ->assertInertia(fn ($page) => $page
            ->where('action_items', [])
        );
});

it('clears salary negotiation item when offer is rejected', function () {
    $application = JobApplication::factory()->create([
        'user_id' => $this->user->id,
        'status' => 'offer',
        'offered_salary' => 50000,
    ]);

    $this->get(route('dashboard'))
        ->assertInertia(fn ($page) => $page
            ->has('action_items', 1)
        );

    $application->update(['status' => 'rejected']);

    $this->get(route('dashboard'))
        ->assertInertia(fn ($page) => $page
            ->where('action_items', [])
        );
});

it('clears upcoming interview when interview passes', function () {
    $application = JobApplication::factory()->create([
        'user_id' => $this->user->id,
        'status' => 'applied',
        'interview_date' => now()->addDays(1),
        'ai_evaluated_at' => now(),
        'last_contacted_at' => now(),
    ]);

    $this->get(route('dashboard'))
        ->assertInertia(fn ($page) => $page
            ->has('action_items', 1)
        );

    $this->travelTo(now()->addDays(2));

    $this->get(route('dashboard'))
        ->assertInertia(fn ($page) => $page
            ->where('action_items', [])
        );

    $this->travelBack();
});
