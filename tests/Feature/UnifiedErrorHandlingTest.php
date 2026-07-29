<?php

use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    $this->user = User::factory()->create();
});

it('returns validation errors as inertia errors when creating a job application with missing fields', function () {
    $this->actingAs($this->user)
        ->post(route('job-applications.store'), [])
        ->assertSessionHasErrors(['company_name', 'job_title', 'location']);
});

it('returns validation errors as inertia errors when updating a job application with invalid data', function () {
    $application = $this->user->jobApplications()->create(
        \App\Models\JobApplication::factory()->make()->toArray(),
    );

    $this->actingAs($this->user)
        ->patch(route('job-applications.update', $application->id), [
            'company_name' => '',
            'job_title' => '',
        ])
        ->assertSessionHasErrors(['company_name', 'job_title']);
});

it('returns session expired error for guest users on authenticated routes', function () {
    $application = $this->user->jobApplications()->create(
        \App\Models\JobApplication::factory()->make()->toArray(),
    );

    $this->patch(route('job-applications.update', $application->id), [
            'company_name' => 'Test Corp',
        ])
        ->assertRedirect(route('login'));
});

it('returns 403 forbidden when updating another users application', function () {
    $otherUser = User::factory()->create();
    $application = $otherUser->jobApplications()->create(
        \App\Models\JobApplication::factory()->make()->toArray(),
    );

    $this->actingAs($this->user)
        ->patch(route('job-applications.update', $application->id), [
            'company_name' => 'Hacked Corp',
        ])
        ->assertForbidden();
});

it('validates contact form required fields', function () {
    $this->actingAs($this->user)
        ->post(route('contacts.store'), [])
        ->assertSessionHasErrors(['name']);
});

it('validates settings profile fields', function () {
    $this->actingAs($this->user)
        ->patch(route('settings.profile.update'), [
            'name' => '',
            'email' => 'not-an-email',
        ])
        ->assertSessionHasErrors(['name', 'email']);
});

it('validates password change requirements', function () {
    $this->actingAs($this->user)
        ->patch(route('settings.password.update'), [
            'current_password' => '',
            'password' => '',
        ])
        ->assertSessionHasErrors(['current_password', 'password']);
});
