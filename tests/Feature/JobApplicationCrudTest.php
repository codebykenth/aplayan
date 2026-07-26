<?php

use App\Models\JobApplication;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->otherUser = User::factory()->create();
});

it('redirects unauthenticated users to login', function () {
    $this->get(route('job-applications.index'))->assertRedirect();
    $this->post(route('job-applications.store'), [])->assertRedirect();
    $this->put(route('job-applications.update', JobApplication::factory()->create()), [])->assertRedirect();
    $this->delete(route('job-applications.destroy', JobApplication::factory()->create()))->assertRedirect();
});

it('lists only the authenticated users job applications', function () {
    $own = JobApplication::factory()->count(2)->create(['user_id' => $this->user->id]);
    JobApplication::factory()->count(3)->create(['user_id' => $this->otherUser->id]);

    $this->actingAs($this->user)->get(route('job-applications.index'))->assertSuccessful();

    $this->assertDatabaseCount('job_applications', 5);
    expect($this->user->jobApplications()->count())->toBe(2);
});

it('stores a new job application for the authenticated user', function () {
    $data = JobApplication::factory()->make(['user_id' => $this->user->id])->toArray();

    $response = $this->actingAs($this->user)->post(route('job-applications.store'), $data);

    $response->assertRedirect(route('job-applications.index'));
    $this->assertDatabaseHas('job_applications', [
        'company_name' => $data['company_name'],
        'user_id' => $this->user->id,
    ]);
});

it('updates an existing job application owned by the user', function () {
    $application = JobApplication::factory()->create(['user_id' => $this->user->id]);

    $response = $this->actingAs($this->user)->put(
        route('job-applications.update', $application),
        ['company_name' => 'Updated Corp', 'job_title' => 'New Role', 'location' => 'Remote', 'status' => 'applied'],
    );

    $response->assertRedirect(route('job-applications.index'));
    $this->assertDatabaseHas('job_applications', [
        'id' => $application->id,
        'company_name' => 'Updated Corp',
    ]);
});

it('deletes a job application owned by the user', function () {
    $application = JobApplication::factory()->create(['user_id' => $this->user->id]);

    $response = $this->actingAs($this->user)->delete(route('job-applications.destroy', $application));

    $response->assertRedirect(route('job-applications.index'));
    $this->assertModelMissing($application);
});

it('returns 403 when viewing another users application', function () {
    $application = JobApplication::factory()->create(['user_id' => $this->otherUser->id]);

    $this->actingAs($this->user)->getJson(route('job-applications.show', $application))->assertForbidden();
});

it('returns 403 when updating another users application', function () {
    $application = JobApplication::factory()->create(['user_id' => $this->otherUser->id]);

    $this->actingAs($this->user)->putJson(
        route('job-applications.update', $application),
        ['company_name' => 'Hacked', 'job_title' => 'Engineer', 'location' => 'Remote', 'status' => 'applied'],
    )->assertForbidden();
});

it('returns 403 when deleting another users application', function () {
    $application = JobApplication::factory()->create(['user_id' => $this->otherUser->id]);

    $this->actingAs($this->user)->deleteJson(route('job-applications.destroy', $application))->assertForbidden();
});

it('validates required fields on store', function () {
    $response = $this->actingAs($this->user)->postJson(route('job-applications.store'), []);

    $response->assertJsonValidationErrors(['company_name', 'job_title', 'location', 'status']);
});

it('validates company name is a string on store', function () {
    $response = $this->actingAs($this->user)->postJson(route('job-applications.store'), [
        'company_name' => 123,
        'job_title' => 'Engineer',
        'location' => 'Remote',
        'status' => 'applied',
    ]);

    $response->assertJsonValidationErrors(['company_name']);
});

it('validates status is a valid value', function () {
    $response = $this->actingAs($this->user)->postJson(route('job-applications.store'), [
        'company_name' => 'Acme',
        'job_title' => 'Engineer',
        'location' => 'Remote',
        'status' => 'invalid-status',
    ]);

    $response->assertJsonValidationErrors(['status']);
});

it('validates required fields on update', function () {
    $application = JobApplication::factory()->create(['user_id' => $this->user->id]);

    $response = $this->actingAs($this->user)->putJson(route('job-applications.update', $application), []);

    $response->assertJsonValidationErrors(['company_name', 'job_title', 'location', 'status']);
});

it('shows a single job application owned by the user', function () {
    $application = JobApplication::factory()->create(['user_id' => $this->user->id]);

    $response = $this->actingAs($this->user)->getJson(route('job-applications.show', $application));

    $response->assertSuccessful();
    expect($response->json('data.id'))->toBe($application->id);
    expect($response->json('data'))->toHaveKeys([
        'id', 'user_id', 'company_name', 'job_title', 'job_url', 'job_description',
        'location', 'status', 'date_applied', 'expected_salary', 'offered_salary',
        'notes', 'ai_match_percentage', 'ai_strengths', 'ai_gaps',
        'ai_salary_min', 'ai_salary_max', 'ai_salary_notes', 'ai_evaluated_at',
        'created_at', 'updated_at',
    ]);
});
