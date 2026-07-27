<?php

use App\Models\JobApplication;
use App\Models\User;
use App\Services\ActivityService;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->service = app(ActivityService::class);
    $this->user = User::factory()->create();
});

it('returns recent activities for a user', function () {
    $application = JobApplication::factory()->create([
        'user_id' => $this->user->id,
    ]);

    $application->activities()->create([
        'type' => 'note',
        'description' => 'A test note',
    ]);

    $result = $this->service->recentForUser($this->user);

    expect($result)->toHaveCount(1)
        ->and($result[0]['type'])->toBe('note')
        ->and($result[0]['description'])->toBe('A test note')
        ->and($result[0]['company_name'])->toBe($application->company_name)
        ->and($result[0]['job_application_id'])->toBe($application->id);
});

it('respects the limit parameter', function () {
    $application = JobApplication::factory()->create([
        'user_id' => $this->user->id,
    ]);

    for ($i = 0; $i < 15; $i++) {
        $application->activities()->create([
            'type' => 'note',
            'description' => "Activity $i",
        ]);
    }

    $result = $this->service->recentForUser($this->user, 5);

    expect($result)->toHaveCount(5);
});

it('returns empty collection when user has no activities', function () {
    JobApplication::factory()->create([
        'user_id' => $this->user->id,
    ]);

    $result = $this->service->recentForUser($this->user);

    expect($result)->toHaveCount(0);
});

it('does not include activities from other users', function () {
    $otherUser = User::factory()->create();

    $myApplication = JobApplication::factory()->create([
        'user_id' => $this->user->id,
    ]);

    $otherApplication = JobApplication::factory()->create([
        'user_id' => $otherUser->id,
    ]);

    $myApplication->activities()->create([
        'type' => 'note',
        'description' => 'My activity',
    ]);

    $otherApplication->activities()->create([
        'type' => 'note',
        'description' => 'Other activity',
    ]);

    $result = $this->service->recentForUser($this->user);

    expect($result)->toHaveCount(1)
        ->and($result[0]['description'])->toBe('My activity');
});

it('orders activities from most recent to oldest', function () {
    $application = JobApplication::factory()->create([
        'user_id' => $this->user->id,
    ]);

    $old = $application->activities()->create([
        'type' => 'note',
        'description' => 'Old activity',
    ]);

    $old->forceFill(['created_at' => now()->subDays(2)])->save();

    $new = $application->activities()->create([
        'type' => 'note',
        'description' => 'New activity',
    ]);

    $result = $this->service->recentForUser($this->user);

    expect($result)->toHaveCount(2)
        ->and($result[0]['description'])->toBe('New activity')
        ->and($result[1]['description'])->toBe('Old activity');
});

it('eager loads the job application relationship', function () {
    $application = JobApplication::factory()->create([
        'user_id' => $this->user->id,
    ]);

    $application->activities()->create([
        'type' => 'note',
        'description' => 'Test',
    ]);

    $result = $this->service->recentForUser($this->user);

    expect($result[0]['company_name'])->toBe($application->company_name);
});
