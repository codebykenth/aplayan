<?php

use App\Models\JobApplication;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->otherUser = User::factory()->create();
    $this->application = JobApplication::factory()->create(['user_id' => $this->user->id]);
});

it('records a status_update activity when application status is changed', function () {
    $this->actingAs($this->user)
        ->patchJson(
            route('job-applications.status', $this->application),
            ['status' => 'applied'],
        );

    $this->assertDatabaseHas('job_application_activities', [
        'job_application_id' => $this->application->id,
        'type' => 'status_update',
    ]);
});

it('records a note activity when application notes are modified', function () {
    $this->actingAs($this->user)
        ->putJson(
            route('job-applications.update', $this->application),
            ['company_name' => $this->application->company_name, 'job_title' => $this->application->job_title, 'location' => $this->application->location, 'status' => $this->application->status, 'notes' => 'Interview scheduled for Monday'],
        );

    $this->assertDatabaseHas('job_application_activities', [
        'job_application_id' => $this->application->id,
        'type' => 'note',
    ]);
});

it('does not record a note activity when notes have not changed', function () {
    $this->actingAs($this->user)
        ->putJson(
            route('job-applications.update', $this->application),
            ['company_name' => $this->application->company_name, 'job_title' => $this->application->job_title, 'location' => $this->application->location, 'status' => $this->application->status, 'notes' => $this->application->notes],
        );

    $this->assertDatabaseCount('job_application_activities', 0);
});

it('returns activities in the show response', function () {
    $this->application->activities()->create([
        'type' => 'status_update',
        'description' => 'Status changed to applied',
    ]);

    $response = $this->actingAs($this->user)
        ->getJson(route('job-applications.show', $this->application));

    $response->assertSuccessful();
    $data = $response->json('data');

    expect($data)->toHaveKey('activities');
    expect($data['activities'])->toBeArray()
        ->and($data['activities'])->toHaveCount(1)
        ->and($data['activities'][0])->toHaveKeys(['id', 'type', 'description', 'created_at']);
    expect($data['activities'][0]['type'])->toBe('status_update');
});

it('returns empty activities array when no activities exist', function () {
    $response = $this->actingAs($this->user)
        ->getJson(route('job-applications.show', $this->application));

    $response->assertSuccessful();
    expect($response->json('data.activities'))->toBe([]);
});

it('returns activities in reverse chronological order', function () {
    $now = now();
    DB::table('job_application_activities')->insert([
        ['job_application_id' => $this->application->id, 'type' => 'status_update', 'description' => 'Status changed to applied', 'created_at' => $now->copy()->subSeconds(2), 'updated_at' => $now->copy()->subSeconds(2)],
        ['job_application_id' => $this->application->id, 'type' => 'note', 'description' => 'Note updated', 'created_at' => $now->copy()->subSeconds(1), 'updated_at' => $now->copy()->subSeconds(1)],
    ]);

    $response = $this->actingAs($this->user)
        ->getJson(route('job-applications.show', $this->application));

    $response->assertSuccessful();
    $activities = $response->json('data.activities');

    expect($activities)->toHaveCount(2);
    expect($activities[0]['type'])->toBe('note');
    expect($activities[1]['type'])->toBe('status_update');
});

it('returns 403 when viewing activities of another users application', function () {
    $otherApplication = JobApplication::factory()->create(['user_id' => $this->otherUser->id]);
    $otherApplication->activities()->create([
        'type' => 'status_update',
        'description' => 'Status changed',
    ]);

    $this->actingAs($this->user)
        ->getJson(route('job-applications.show', $otherApplication))
        ->assertForbidden();
});

it('returns 403 when recording activity on another users application status update', function () {
    $otherApplication = JobApplication::factory()->create(['user_id' => $this->otherUser->id]);

    $this->actingAs($this->user)
        ->patchJson(
            route('job-applications.status', $otherApplication),
            ['status' => 'interviewing'],
        )
        ->assertForbidden();

    $this->assertDatabaseCount('job_application_activities', 0);
});

it('records multiple activities for the same application', function () {
    $this->actingAs($this->user)
        ->patchJson(
            route('job-applications.status', $this->application),
            ['status' => 'applied'],
        );

    $this->actingAs($this->user)
        ->putJson(
            route('job-applications.update', $this->application),
            ['company_name' => $this->application->company_name, 'job_title' => $this->application->job_title, 'location' => $this->application->location, 'status' => 'applied', 'notes' => 'Following up on application'],
        );

    $this->actingAs($this->user)
        ->patchJson(
            route('job-applications.status', $this->application),
            ['status' => 'interviewing'],
        );

    $this->assertDatabaseCount('job_application_activities', 3);
});
