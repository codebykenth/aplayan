<?php

use App\Models\CoverLetterTemplate;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->otherUser = User::factory()->create();
});

it('redirects unauthenticated users to login', function () {
    $this->get(route('cover-letter-templates.index'))->assertRedirect();
    $this->post(route('cover-letter-templates.store'), [])->assertRedirect();
    $this->put(route('cover-letter-templates.update', CoverLetterTemplate::factory()->create()), [])->assertRedirect();
    $this->delete(route('cover-letter-templates.destroy', CoverLetterTemplate::factory()->create()))->assertRedirect();
});

it('lists only the authenticated users cover letter templates', function () {
    CoverLetterTemplate::factory()->count(2)->create(['user_id' => $this->user->id]);
    CoverLetterTemplate::factory()->count(3)->create(['user_id' => $this->otherUser->id]);

    $response = $this->actingAs($this->user)->get(route('cover-letter-templates.index'));

    $response->assertSuccessful();
    $this->assertDatabaseCount('cover_letter_templates', 5);
    expect($this->user->coverLetterTemplates()->count())->toBe(2);
});

it('stores a new cover letter template for the authenticated user', function () {
    $data = CoverLetterTemplate::factory()->make(['user_id' => $this->user->id])->toArray();

    $response = $this->actingAs($this->user)->post(route('cover-letter-templates.store'), $data);

    $response->assertRedirect(route('cover-letter-templates.index'));
    $this->assertDatabaseHas('cover_letter_templates', [
        'title' => $data['title'],
        'user_id' => $this->user->id,
    ]);
});

it('updates an existing cover letter template owned by the user', function () {
    $template = CoverLetterTemplate::factory()->create(['user_id' => $this->user->id]);

    $response = $this->actingAs($this->user)->put(
        route('cover-letter-templates.update', $template),
        ['title' => 'Updated Cover Letter', 'recipient' => 'HR Manager', 'content' => 'Updated content'],
    );

    $response->assertRedirect(route('cover-letter-templates.index'));
    $this->assertDatabaseHas('cover_letter_templates', [
        'id' => $template->id,
        'title' => 'Updated Cover Letter',
        'recipient' => 'HR Manager',
    ]);
});

it('deletes a cover letter template owned by the user', function () {
    $template = CoverLetterTemplate::factory()->create(['user_id' => $this->user->id]);

    $response = $this->actingAs($this->user)->delete(route('cover-letter-templates.destroy', $template));

    $response->assertRedirect(route('cover-letter-templates.index'));
    $this->assertModelMissing($template);
});

it('returns 403 when updating another users cover letter template', function () {
    $template = CoverLetterTemplate::factory()->create(['user_id' => $this->otherUser->id]);

    $this->actingAs($this->user)->putJson(
        route('cover-letter-templates.update', $template),
        ['title' => 'Hacked Template', 'content' => 'Hacked content'],
    )->assertForbidden();
});

it('returns 403 when deleting another users cover letter template', function () {
    $template = CoverLetterTemplate::factory()->create(['user_id' => $this->otherUser->id]);

    $this->actingAs($this->user)->deleteJson(route('cover-letter-templates.destroy', $template))->assertForbidden();
});

it('validates required fields on store', function () {
    $response = $this->actingAs($this->user)->postJson(route('cover-letter-templates.store'), []);

    $response->assertJsonValidationErrors(['title', 'content']);
});

it('validates title is a string on store', function () {
    $response = $this->actingAs($this->user)->postJson(route('cover-letter-templates.store'), [
        'title' => 123,
        'content' => 'Test content',
    ]);

    $response->assertJsonValidationErrors(['title']);
});

it('validates required fields on update', function () {
    $template = CoverLetterTemplate::factory()->create(['user_id' => $this->user->id]);

    $response = $this->actingAs($this->user)->putJson(route('cover-letter-templates.update', $template), [
        'title' => '',
    ]);

    $response->assertJsonValidationErrors(['title']);
});

it('validates content is required on store', function () {
    $response = $this->actingAs($this->user)->postJson(route('cover-letter-templates.store'), [
        'title' => 'My Template',
    ]);

    $response->assertJsonValidationErrors(['content']);
});

it('validates recipient is optional on store', function () {
    $data = CoverLetterTemplate::factory()->make([
        'user_id' => $this->user->id,
        'recipient' => null,
    ])->toArray();

    $response = $this->actingAs($this->user)->post(route('cover-letter-templates.store'), $data);

    $response->assertRedirect(route('cover-letter-templates.index'));
    $this->assertDatabaseHas('cover_letter_templates', [
        'title' => $data['title'],
        'user_id' => $this->user->id,
    ]);
});

it('can store a cover letter template with a recipient', function () {
    $data = CoverLetterTemplate::factory()->make([
        'user_id' => $this->user->id,
        'recipient' => 'Engineering Manager',
    ])->toArray();

    $response = $this->actingAs($this->user)->post(route('cover-letter-templates.store'), $data);

    $response->assertRedirect(route('cover-letter-templates.index'));
    $this->assertDatabaseHas('cover_letter_templates', [
        'title' => $data['title'],
        'recipient' => 'Engineering Manager',
        'user_id' => $this->user->id,
    ]);
});

it('can store a cover letter template with dynamic placeholders', function () {
    $data = CoverLetterTemplate::factory()->make([
        'user_id' => $this->user->id,
        'content' => 'Dear [Recipient], I am interested in the [Job Title] position at [Company Name]. My name is [Your Name].',
    ])->toArray();

    $response = $this->actingAs($this->user)->post(route('cover-letter-templates.store'), $data);

    $response->assertRedirect(route('cover-letter-templates.index'));
    $this->assertDatabaseHas('cover_letter_templates', [
        'content' => 'Dear [Recipient], I am interested in the [Job Title] position at [Company Name]. My name is [Your Name].',
    ]);
});
