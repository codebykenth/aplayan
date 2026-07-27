<?php

use App\Models\Contact;
use App\Models\JobApplication;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->otherUser = User::factory()->create();
});

it('redirects unauthenticated users to login', function () {
    $this->get(route('contacts.index'))->assertRedirect();
    $this->post(route('contacts.store'), [])->assertRedirect();
    $this->put(route('contacts.update', Contact::factory()->create()), [])->assertRedirect();
    $this->delete(route('contacts.destroy', Contact::factory()->create()))->assertRedirect();
});

it('lists only the authenticated users contacts', function () {
    Contact::factory()->count(2)->create(['user_id' => $this->user->id]);
    Contact::factory()->count(3)->create(['user_id' => $this->otherUser->id]);

    $this->actingAs($this->user)->get(route('contacts.index'))->assertSuccessful();

    $this->assertDatabaseCount('contacts', 5);
    expect($this->user->contacts()->count())->toBe(2);
});

it('stores a new contact for the authenticated user', function () {
    $data = Contact::factory()->make(['user_id' => $this->user->id])->toArray();

    $response = $this->actingAs($this->user)->post(route('contacts.store'), $data);

    $response->assertRedirect(route('contacts.index'));
    $this->assertDatabaseHas('contacts', [
        'name' => $data['name'],
        'user_id' => $this->user->id,
    ]);
});

it('updates an existing contact owned by the user', function () {
    $contact = Contact::factory()->create(['user_id' => $this->user->id]);

    $response = $this->actingAs($this->user)->put(
        route('contacts.update', $contact),
        ['name' => 'Updated Contact', 'email' => 'updated@example.com'],
    );

    $response->assertRedirect(route('contacts.index'));
    $this->assertDatabaseHas('contacts', [
        'id' => $contact->id,
        'name' => 'Updated Contact',
    ]);
});

it('deletes a contact owned by the user', function () {
    $contact = Contact::factory()->create(['user_id' => $this->user->id]);

    $response = $this->actingAs($this->user)->delete(route('contacts.destroy', $contact));

    $response->assertRedirect(route('contacts.index'));
    $this->assertModelMissing($contact);
});

it('returns 403 when updating another users contact', function () {
    $contact = Contact::factory()->create(['user_id' => $this->otherUser->id]);

    $this->actingAs($this->user)->putJson(
        route('contacts.update', $contact),
        ['name' => 'Hacked Contact'],
    )->assertForbidden();
});

it('returns 403 when deleting another users contact', function () {
    $contact = Contact::factory()->create(['user_id' => $this->otherUser->id]);

    $this->actingAs($this->user)->deleteJson(route('contacts.destroy', $contact))->assertForbidden();
});

it('validates required fields on store', function () {
    $response = $this->actingAs($this->user)->postJson(route('contacts.store'), []);

    $response->assertJsonValidationErrors(['name']);
});

it('validates name is a string on store', function () {
    $response = $this->actingAs($this->user)->postJson(route('contacts.store'), [
        'name' => 123,
    ]);

    $response->assertJsonValidationErrors(['name']);
});

it('validates email is valid format on store', function () {
    $response = $this->actingAs($this->user)->postJson(route('contacts.store'), [
        'name' => 'John Doe',
        'email' => 'not-an-email',
    ]);

    $response->assertJsonValidationErrors(['email']);
});

it('validates required fields on update', function () {
    $contact = Contact::factory()->create(['user_id' => $this->user->id]);

    $response = $this->actingAs($this->user)->putJson(route('contacts.update', $contact), [
        'name' => '',
    ]);

    $response->assertJsonValidationErrors(['name']);
});

it('links a contact to a job application', function () {
    $contact = Contact::factory()->create(['user_id' => $this->user->id]);
    $jobApplication = JobApplication::factory()->create(['user_id' => $this->user->id]);

    $response = $this->actingAs($this->user)->post(route('contacts.link', $contact), [
        'job_application_id' => $jobApplication->id,
    ]);

    $response->assertRedirect();
    $this->assertDatabaseHas('contact_job_application', [
        'contact_id' => $contact->id,
        'job_application_id' => $jobApplication->id,
    ]);
});

it('unlinks a contact from a job application', function () {
    $contact = Contact::factory()->create(['user_id' => $this->user->id]);
    $jobApplication = JobApplication::factory()->create(['user_id' => $this->user->id]);
    $contact->jobApplications()->attach($jobApplication->id);

    $response = $this->actingAs($this->user)->post(route('contacts.unlink', $contact), [
        'job_application_id' => $jobApplication->id,
    ]);

    $response->assertRedirect();
    $this->assertDatabaseMissing('contact_job_application', [
        'contact_id' => $contact->id,
        'job_application_id' => $jobApplication->id,
    ]);
});

it('prevents linking a contact to another users job application', function () {
    $contact = Contact::factory()->create(['user_id' => $this->user->id]);
    $otherJobApplication = JobApplication::factory()->create(['user_id' => $this->otherUser->id]);

    $this->actingAs($this->user)->postJson(route('contacts.link', $contact), [
        'job_application_id' => $otherJobApplication->id,
    ])->assertForbidden();
});

it('validates job_application_id exists on link', function () {
    $contact = Contact::factory()->create(['user_id' => $this->user->id]);

    $this->actingAs($this->user)->postJson(route('contacts.link', $contact), [
        'job_application_id' => 99999,
    ])->assertJsonValidationErrors(['job_application_id']);
});

it('does not duplicate link when linking same application twice', function () {
    $contact = Contact::factory()->create(['user_id' => $this->user->id]);
    $jobApplication = JobApplication::factory()->create(['user_id' => $this->user->id]);

    $this->actingAs($this->user)->post(route('contacts.link', $contact), [
        'job_application_id' => $jobApplication->id,
    ]);
    $this->actingAs($this->user)->post(route('contacts.link', $contact), [
        'job_application_id' => $jobApplication->id,
    ]);

    $this->assertDatabaseCount('contact_job_application', 1);
});
