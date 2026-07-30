<?php

use App\Models\LegalDocument;
use App\Models\User;

test('non-admin users cannot access legal documents admin page', function () {
    $user = User::factory()->create(['role' => 'user']);

    $response = $this->actingAs($user)->get(route('admin.legal-documents.index'));

    $response->assertForbidden();
});

test('admin can view legal documents page', function () {
    $admin = User::factory()->admin()->create();

    $response = $this->actingAs($admin)->get(route('admin.legal-documents.index'));

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('admin/legal/index')
        ->has('documents')
    );
});

test('admin can update a legal document', function () {
    $admin = User::factory()->admin()->create();
    $document = LegalDocument::create([
        'key' => 'privacy-policy',
        'title' => 'Privacy Policy',
        'content' => 'Old content',
        'version' => 1,
    ]);

    $response = $this->actingAs($admin)
        ->put(route('admin.legal-documents.update', $document), [
            'title' => 'Updated Privacy Policy',
            'content' => 'Updated content',
        ]);

    $response->assertSessionHas('status');
    $document->refresh();
    expect($document->title)->toBe('Updated Privacy Policy');
    expect($document->content)->toBe('Updated content');
    expect($document->version)->toBe(2);
});

test('legal document validation requires title and content', function () {
    $admin = User::factory()->admin()->create();
    $document = LegalDocument::create([
        'key' => 'privacy-policy',
        'title' => 'Privacy Policy',
        'content' => 'Content',
        'version' => 1,
    ]);

    $response = $this->actingAs($admin)
        ->put(route('admin.legal-documents.update', $document), [
            'title' => '',
            'content' => '',
        ]);

    $response->assertSessionHasErrors(['title', 'content']);
});

test('public privacy policy page renders with document from database', function () {
    LegalDocument::create([
        'key' => 'privacy-policy',
        'title' => 'Privacy Policy',
        'content' => '### Updated Privacy Content',
        'version' => 1,
    ]);

    $response = $this->get(route('privacy-policy'));

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('public/privacy-policy/index')
        ->has('document')
    );
});

test('public terms of service page renders with document from database', function () {
    LegalDocument::create([
        'key' => 'terms-of-service',
        'title' => 'Terms of Service',
        'content' => '### Updated Terms Content',
        'version' => 1,
    ]);

    $response = $this->get(route('terms-of-service'));

    $response->assertStatus(200);
    $response->assertInertia(fn ($page) => $page
        ->component('public/terms-of-service/index')
        ->has('document')
    );
});
