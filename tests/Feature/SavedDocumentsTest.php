<?php

use App\Models\SavedCoverLetter;
use App\Models\SavedResume;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
});

it('redirects unauthenticated users to login for saved documents index', function () {
    $this->get(route('documents.saved'))->assertRedirect();
});

it('redirects unauthenticated users to login for save resume', function () {
    $this->post(route('documents.save-resume'))->assertRedirect();
});

it('redirects unauthenticated users to login for save cover letter', function () {
    $this->post(route('documents.save-cover-letter'))->assertRedirect();
});

it('shows saved documents page for authenticated users', function () {
    $this->actingAs($this->user)
        ->get(route('documents.saved'))
        ->assertInertia(fn ($page) => $page
            ->component('documents/saved')
            ->has('resumes')
            ->has('coverLetters')
        );
});

it('displays empty state when no saved documents exist', function () {
    $this->actingAs($this->user)
        ->get(route('documents.saved'))
        ->assertInertia(fn ($page) => $page
            ->where('resumes', [])
            ->where('coverLetters', [])
        );
});

it('shows saved resumes for the authenticated user', function () {
    SavedResume::factory()->create([
        'user_id' => $this->user->id,
        'name' => 'TechCorp Application',
        'template' => 'modern',
    ]);

    $this->actingAs($this->user)
        ->get(route('documents.saved'))
        ->assertInertia(fn ($page) => $page
            ->has('resumes', 1)
            ->where('resumes.0.name', 'TechCorp Application')
            ->where('resumes.0.template', 'modern')
        );
});

it('scopes saved resumes to authenticated user', function () {
    $otherUser = User::factory()->create();
    SavedResume::factory()->create([
        'user_id' => $otherUser->id,
        'name' => 'Other User Resume',
    ]);

    $this->actingAs($this->user)
        ->get(route('documents.saved'))
        ->assertInertia(fn ($page) => $page
            ->where('resumes', [])
        );
});

it('shows saved cover letters for the authenticated user', function () {
    SavedCoverLetter::factory()->create([
        'user_id' => $this->user->id,
        'content' => 'Dear Hiring Manager, Test cover letter.',
    ]);

    $this->actingAs($this->user)
        ->get(route('documents.saved'))
        ->assertInertia(fn ($page) => $page
            ->has('coverLetters', 1)
            ->where('coverLetters.0.content', 'Dear Hiring Manager, Test cover letter.')
        );
});

it('scopes saved cover letters to authenticated user', function () {
    $otherUser = User::factory()->create();
    SavedCoverLetter::factory()->create([
        'user_id' => $otherUser->id,
    ]);

    $this->actingAs($this->user)
        ->get(route('documents.saved'))
        ->assertInertia(fn ($page) => $page
            ->where('coverLetters', [])
        );
});

it('saves a resume version', function () {
    $profileData = [
        'full_name' => 'Juan Dela Cruz',
        'email' => 'juan@example.com',
        'phone' => '+63 917 123 4567',
        'location' => 'Metro Manila',
        'summary' => 'Experienced developer.',
        'work_experience' => [],
        'education' => [],
        'skills' => ['PHP', 'Laravel'],
        'certifications' => [],
    ];

    $response = $this->actingAs($this->user)->post(route('documents.save-resume'), [
        'name' => 'Test Resume v1',
        'template' => 'clean',
        'profile_data' => $profileData,
    ]);

    $response->assertRedirect(route('documents.saved'));
    $this->assertDatabaseHas('saved_resumes', [
        'user_id' => $this->user->id,
        'name' => 'Test Resume v1',
        'template' => 'clean',
    ]);
});

it('validates required fields for saving a resume version', function () {
    $response = $this->actingAs($this->user)->postJson(route('documents.save-resume'), []);

    $response->assertJsonValidationErrors(['name', 'template', 'profile_data']);
});

it('validates template is one of the allowed values', function () {
    $response = $this->actingAs($this->user)->postJson(route('documents.save-resume'), [
        'name' => 'Test',
        'template' => 'invalid-template',
        'profile_data' => ['full_name' => 'Juan'],
    ]);

    $response->assertJsonValidationErrors(['template']);
});

it('saves a cover letter', function () {
    $response = $this->actingAs($this->user)->post(route('documents.save-cover-letter'), [
        'job_description' => 'Senior Developer position requiring PHP and Laravel.',
        'content' => 'Dear Hiring Manager, I am writing to express my interest...',
    ]);

    $response->assertSuccessful();
    $this->assertDatabaseHas('saved_cover_letters', [
        'user_id' => $this->user->id,
        'job_description' => 'Senior Developer position requiring PHP and Laravel.',
    ]);
});

it('validates required fields for saving a cover letter', function () {
    $response = $this->actingAs($this->user)->postJson(route('documents.save-cover-letter'), []);

    $response->assertJsonValidationErrors(['content']);
});

it('deletes a saved resume version', function () {
    $resume = SavedResume::factory()->create([
        'user_id' => $this->user->id,
    ]);

    $response = $this->actingAs($this->user)->delete(route('documents.resume-versions.destroy', $resume));

    $response->assertRedirect(route('documents.saved'));
    $this->assertDatabaseMissing('saved_resumes', ['id' => $resume->id]);
});

it('prevents deleting another users saved resume version', function () {
    $otherUser = User::factory()->create();
    $resume = SavedResume::factory()->create([
        'user_id' => $otherUser->id,
    ]);

    $response = $this->actingAs($this->user)->delete(route('documents.resume-versions.destroy', $resume));

    $response->assertForbidden();
    $this->assertDatabaseHas('saved_resumes', ['id' => $resume->id]);
});

it('deletes a saved cover letter', function () {
    $letter = SavedCoverLetter::factory()->create([
        'user_id' => $this->user->id,
    ]);

    $response = $this->actingAs($this->user)->delete(route('documents.cover-letters.destroy', $letter));

    $response->assertRedirect(route('documents.saved'));
    $this->assertDatabaseMissing('saved_cover_letters', ['id' => $letter->id]);
});

it('prevents deleting another users saved cover letter', function () {
    $otherUser = User::factory()->create();
    $letter = SavedCoverLetter::factory()->create([
        'user_id' => $otherUser->id,
    ]);

    $response = $this->actingAs($this->user)->delete(route('documents.cover-letters.destroy', $letter));

    $response->assertForbidden();
    $this->assertDatabaseHas('saved_cover_letters', ['id' => $letter->id]);
});
