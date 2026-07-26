<?php

use App\Models\ApplicationTemplate;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->otherUser = User::factory()->create();
});

it('redirects unauthenticated users to login', function () {
    $this->get(route('templates.index'))->assertRedirect();
    $this->post(route('templates.store'), [])->assertRedirect();
    $this->put(route('templates.update', ApplicationTemplate::factory()->create()), [])->assertRedirect();
    $this->delete(route('templates.destroy', ApplicationTemplate::factory()->create()))->assertRedirect();
});

it('lists only the authenticated users templates', function () {
    ApplicationTemplate::factory()->count(2)->create(['user_id' => $this->user->id]);
    ApplicationTemplate::factory()->count(3)->create(['user_id' => $this->otherUser->id]);

    $this->actingAs($this->user)->get(route('templates.index'))->assertSuccessful();

    $this->assertDatabaseCount('application_templates', 5);
    expect($this->user->applicationTemplates()->count())->toBe(2);
});

it('stores a new template for the authenticated user', function () {
    $data = ApplicationTemplate::factory()->make(['user_id' => $this->user->id])->toArray();

    $response = $this->actingAs($this->user)->post(route('templates.store'), $data);

    $response->assertRedirect(route('templates.index'));
    $this->assertDatabaseHas('application_templates', [
        'name' => $data['name'],
        'user_id' => $this->user->id,
    ]);
});

it('updates an existing template owned by the user', function () {
    $template = ApplicationTemplate::factory()->create(['user_id' => $this->user->id]);

    $response = $this->actingAs($this->user)->put(
        route('templates.update', $template),
        ['name' => 'Updated Template', 'category' => 'Remote Frontend'],
    );

    $response->assertRedirect(route('templates.index'));
    $this->assertDatabaseHas('application_templates', [
        'id' => $template->id,
        'name' => 'Updated Template',
    ]);
});

it('deletes a template owned by the user', function () {
    $template = ApplicationTemplate::factory()->create(['user_id' => $this->user->id]);

    $response = $this->actingAs($this->user)->delete(route('templates.destroy', $template));

    $response->assertRedirect(route('templates.index'));
    $this->assertModelMissing($template);
});

it('returns 403 when updating another users template', function () {
    $template = ApplicationTemplate::factory()->create(['user_id' => $this->otherUser->id]);

    $this->actingAs($this->user)->putJson(
        route('templates.update', $template),
        ['name' => 'Hacked Template'],
    )->assertForbidden();
});

it('returns 403 when deleting another users template', function () {
    $template = ApplicationTemplate::factory()->create(['user_id' => $this->otherUser->id]);

    $this->actingAs($this->user)->deleteJson(route('templates.destroy', $template))->assertForbidden();
});

it('validates required fields on store', function () {
    $response = $this->actingAs($this->user)->postJson(route('templates.store'), []);

    $response->assertJsonValidationErrors(['name']);
});

it('validates name is a string on store', function () {
    $response = $this->actingAs($this->user)->postJson(route('templates.store'), [
        'name' => 123,
    ]);

    $response->assertJsonValidationErrors(['name']);
});

it('validates required fields on update', function () {
    $template = ApplicationTemplate::factory()->create(['user_id' => $this->user->id]);

    $response = $this->actingAs($this->user)->putJson(route('templates.update', $template), [
        'name' => '',
    ]);

    $response->assertJsonValidationErrors(['name']);
});
