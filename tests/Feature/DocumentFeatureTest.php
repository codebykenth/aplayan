<?php

use App\Models\ResumeProfile;
use App\Models\User;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->otherUser = User::factory()->create();
});

it('redirects unauthenticated users to login for documents index', function () {
    $this->get(route('documents.index'))->assertRedirect();
});

it('redirects unauthenticated users to login for profile update', function () {
    $this->put(route('documents.profile.update'))->assertRedirect();
});

it('redirects unauthenticated users to login for cover letter generation', function () {
    $this->post(route('documents.cover-letter'))->assertRedirect();
});

it('renders the documents page for authenticated users', function () {
    $this->actingAs($this->user)
        ->get(route('documents.index'))
        ->assertInertia(fn ($page) => $page
            ->component('documents/index')
            ->has('profile')
        );
});

it('returns empty profile when user has none', function () {
    $this->actingAs($this->user)
        ->get(route('documents.index'))
        ->assertInertia(fn ($page) => $page
            ->where('profile', null)
        );
});

it('returns existing profile for authenticated user', function () {
    ResumeProfile::factory()->create(['user_id' => $this->user->id]);

    $this->actingAs($this->user)
        ->get(route('documents.index'))
        ->assertInertia(fn ($page) => $page
            ->has('profile')
        );
});

it('stores a new profile for the authenticated user', function () {
    $data = [
        'full_name' => 'Juan Dela Cruz',
        'email' => 'juan@example.com',
        'phone' => '+63 917 123 4567',
        'location' => 'Metro Manila',
        'summary' => 'Experienced software developer.',
        'work_experience' => [
            ['company' => 'Acme Corp', 'position' => 'Developer', 'duration' => '2020-2023', 'description' => 'Built web apps.'],
        ],
        'education' => [
            ['institution' => 'UP Diliman', 'degree' => 'BS Computer Science', 'year' => '2020'],
        ],
        'skills' => ['PHP', 'Laravel', 'React'],
        'certifications' => ['AWS Solutions Architect'],
    ];

    $response = $this->actingAs($this->user)->put(route('documents.profile.update'), $data);

    $response->assertRedirect(route('documents.index'));
    $this->assertDatabaseHas('resume_profiles', [
        'user_id' => $this->user->id,
        'full_name' => 'Juan Dela Cruz',
    ]);
});

it('updates an existing profile for the authenticated user', function () {
    ResumeProfile::factory()->create(['user_id' => $this->user->id]);

    $data = [
        'full_name' => 'Updated Name',
        'email' => 'updated@example.com',
        'phone' => '+63 917 999 9999',
        'location' => 'Cebu',
        'summary' => 'Updated summary.',
        'work_experience' => [],
        'education' => [],
        'skills' => [],
        'certifications' => [],
    ];

    $response = $this->actingAs($this->user)->put(route('documents.profile.update'), $data);

    $response->assertRedirect(route('documents.index'));
    $this->assertDatabaseHas('resume_profiles', [
        'user_id' => $this->user->id,
        'full_name' => 'Updated Name',
    ]);
});

it('validates required fields on profile update', function () {
    $response = $this->actingAs($this->user)->putJson(route('documents.profile.update'), []);

    $response->assertJsonValidationErrors(['full_name', 'email', 'phone', 'location']);
});

it('validates email format on profile update', function () {
    $response = $this->actingAs($this->user)->putJson(route('documents.profile.update'), [
        'full_name' => 'Juan',
        'email' => 'not-an-email',
        'phone' => '+63 917 123 4567',
        'location' => 'Metro Manila',
    ]);

    $response->assertJsonValidationErrors(['email']);
});

it('validates work_experience is an array', function () {
    $response = $this->actingAs($this->user)->putJson(route('documents.profile.update'), [
        'full_name' => 'Juan',
        'email' => 'juan@example.com',
        'phone' => '+63 917 123 4567',
        'location' => 'Metro Manila',
        'work_experience' => 'not-an-array',
    ]);

    $response->assertJsonValidationErrors(['work_experience']);
});

it('validates skills is an array', function () {
    $response = $this->actingAs($this->user)->putJson(route('documents.profile.update'), [
        'full_name' => 'Juan',
        'email' => 'juan@example.com',
        'phone' => '+63 917 123 4567',
        'location' => 'Metro Manila',
        'skills' => 'not-an-array',
    ]);

    $response->assertJsonValidationErrors(['skills']);
});

it('validates education is an array', function () {
    $response = $this->actingAs($this->user)->putJson(route('documents.profile.update'), [
        'full_name' => 'Juan',
        'email' => 'juan@example.com',
        'phone' => '+63 917 123 4567',
        'location' => 'Metro Manila',
        'education' => 'not-an-array',
    ]);

    $response->assertJsonValidationErrors(['education']);
});

it('validates certifications is an array', function () {
    $response = $this->actingAs($this->user)->putJson(route('documents.profile.update'), [
        'full_name' => 'Juan',
        'email' => 'juan@example.com',
        'phone' => '+63 917 123 4567',
        'location' => 'Metro Manila',
        'certifications' => 'not-an-array',
    ]);

    $response->assertJsonValidationErrors(['certifications']);
});

it('scopes profile to authenticated user', function () {
    $profile = ResumeProfile::factory()->create(['user_id' => $this->otherUser->id]);

    $this->actingAs($this->user)
        ->get(route('documents.index'))
        ->assertInertia(fn ($page) => $page
            ->where('profile', null)
        );
});

it('generates a cover letter with valid profile and job description', function () {
    ResumeProfile::factory()->create([
        'user_id' => $this->user->id,
        'full_name' => 'Juan Dela Cruz',
        'summary' => 'Senior PHP developer.',
        'skills' => ['PHP', 'Laravel'],
    ]);

    Http::preventStrayRequests();

    Http::fake([
        'generativelanguage.googleapis.com/*' => Http::response([
            'candidates' => [
                [
                    'content' => [
                        'parts' => [
                            ['text' => 'Dear Hiring Manager, I am writing to express my interest in the Senior Developer position at TechCorp...'],
                        ],
                    ],
                ],
            ],
        ]),
    ]);

    $response = $this->actingAs($this->user)->postJson(route('documents.cover-letter'), [
        'job_description' => 'Senior Developer position at TechCorp requiring PHP and Laravel.',
    ]);

    $response->assertSuccessful()
        ->assertJsonStructure(['cover_letter']);

    expect($response->json('cover_letter'))->toContain('Dear Hiring Manager');
});

it('sends correct prompt to Gemini for cover letter generation', function () {
    ResumeProfile::factory()->create([
        'user_id' => $this->user->id,
        'full_name' => 'Juan Dela Cruz',
        'email' => 'juan@example.com',
        'phone' => '+63 917 123 4567',
        'location' => 'Metro Manila',
        'summary' => 'Senior PHP developer.',
        'skills' => ['PHP', 'Laravel', 'React'],
    ]);

    Http::preventStrayRequests();

    Http::fake([
        'generativelanguage.googleapis.com/*' => Http::response([
            'candidates' => [
                [
                    'content' => [
                        'parts' => [
                            ['text' => 'Cover letter content.'],
                        ],
                    ],
                ],
            ],
        ]),
    ]);

    $this->actingAs($this->user)->postJson(route('documents.cover-letter'), [
        'job_description' => 'Looking for a PHP developer.',
    ]);

    Http::assertSent(function (Request $request) {
        $body = json_decode($request->body(), true);
        $prompt = $body['contents'][0]['parts'][0]['text'];

        return str_contains($prompt, 'Juan Dela Cruz')
            && str_contains($prompt, 'juan@example.com')
            && str_contains($prompt, 'Looking for a PHP developer.')
            && str_contains($prompt, 'PHP')
            && str_contains($prompt, 'Laravel');
    });
});

it('validates job_description is required for cover letter', function () {
    $response = $this->actingAs($this->user)->postJson(route('documents.cover-letter'), []);

    $response->assertJsonValidationErrors(['job_description']);
});

it('returns 422 when profile is missing for cover letter', function () {
    Http::preventStrayRequests();

    $response = $this->actingAs($this->user)->postJson(route('documents.cover-letter'), [
        'job_description' => 'Looking for a PHP developer.',
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['profile']);
});

it('returns 503 when Gemini API fails for cover letter', function () {
    ResumeProfile::factory()->create([
        'user_id' => $this->user->id,
        'full_name' => 'Juan Dela Cruz',
    ]);

    Http::preventStrayRequests();

    Http::fake([
        'generativelanguage.googleapis.com/*' => Http::response([], 500),
    ]);

    $response = $this->actingAs($this->user)->postJson(route('documents.cover-letter'), [
        'job_description' => 'Looking for a PHP developer.',
    ]);

    $response->assertStatus(503);
    expect($response->json('message'))->toBe('AI service is temporarily unavailable.');
});

it('returns empty arrays as defaults for JSON fields', function () {
    $this->actingAs($this->user)->putJson(route('documents.profile.update'), [
        'full_name' => 'Juan',
        'email' => 'juan@example.com',
        'phone' => '+63 917 123 4567',
        'location' => 'Metro Manila',
    ]);

    $profile = ResumeProfile::where('user_id', $this->user->id)->first();

    expect($profile->work_experience)->toBe([]);
    expect($profile->education)->toBe([]);
    expect($profile->skills)->toBe([]);
    expect($profile->certifications)->toBe([]);
});
