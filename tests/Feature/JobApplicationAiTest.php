<?php

use App\Models\JobApplication;
use App\Models\User;
use Illuminate\Http\Client\Request;
use Illuminate\Support\Facades\Http;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->otherUser = User::factory()->create();
    $this->application = JobApplication::factory()->create([
        'user_id' => $this->user->id,
        'job_description' => 'Senior PHP developer with Laravel experience.',
    ]);
});

it('redirects unauthenticated users to login', function () {
    $this->post(route('job-applications.ai-match', $this->application))->assertRedirect();
});

it('returns 403 when analyzing another users application', function () {
    $this->actingAs($this->otherUser)
        ->postJson(route('job-applications.ai-match', $this->application), [
            'resume_text' => '5 years PHP experience.',
        ])
        ->assertForbidden();
});

it('validates resume_text or resume_file is required', function () {
    $this->actingAs($this->user)
        ->postJson(route('job-applications.ai-match', $this->application), [])
        ->assertJsonValidationErrors(['resume_text']);
});

it('analyzes resume match and returns JSON with saved AI fields', function () {
    Http::preventStrayRequests();

    Http::fake([
        'generativelanguage.googleapis.com/*' => Http::response([
            'candidates' => [
                [
                    'content' => [
                        'parts' => [
                            ['text' => '{"match_percentage": 78, "tech_stack_percentage": 80, "experience_percentage": 75, "education_percentage": 70, "strengths": ["Strong PHP skills", "Laravel experience"], "gaps": ["No cloud experience", "Limited testing knowledge"]}'],
                        ],
                    ],
                ],
            ],
        ]),
    ]);

    $response = $this->actingAs($this->user)->postJson(
        route('job-applications.ai-match', $this->application),
        ['resume_text' => '5 years PHP, Laravel developer.'],
    );

    $response->assertSuccessful()
        ->assertJsonStructure([
            'match_percentage',
            'tech_stack_percentage',
            'experience_percentage',
            'education_percentage',
            'strengths',
            'gaps',
            'evaluated_at',
        ]);

    expect($response->json('match_percentage'))->toBe(78);
    expect($response->json('tech_stack_percentage'))->toBe(80);
    expect($response->json('experience_percentage'))->toBe(75);
    expect($response->json('education_percentage'))->toBe(70);
    expect($response->json('strengths'))->toContain('Strong PHP skills', 'Laravel experience');
    expect($response->json('gaps'))->toContain('No cloud experience', 'Limited testing knowledge');

    $this->assertDatabaseHas('job_applications', [
        'id' => $this->application->id,
        'ai_match_percentage' => 78,
        'ai_tech_stack_percentage' => 80,
        'ai_experience_percentage' => 75,
        'ai_education_percentage' => 70,
    ]);

    $fresh = $this->application->fresh();
    expect($fresh->ai_strengths)->toBeArray();
    expect($fresh->ai_gaps)->toBeArray();
    expect($fresh->ai_evaluated_at)->not->toBeNull();
});

it('sends the job description and resume text to Gemini', function () {
    Http::preventStrayRequests();

    Http::fake([
        'generativelanguage.googleapis.com/*' => Http::response([
            'candidates' => [
                [
                    'content' => [
                        'parts' => [
                            ['text' => '{"match_percentage": 50, "tech_stack_percentage": 50, "experience_percentage": 50, "education_percentage": 50, "strengths": [], "gaps": []}'],
                        ],
                    ],
                ],
            ],
        ]),
    ]);

    $this->actingAs($this->user)->postJson(
        route('job-applications.ai-match', $this->application),
        ['resume_text' => 'My resume with React experience.'],
    );

    Http::assertSent(function (Request $request) {
        $body = json_decode($request->body(), true);
        $prompt = $body['contents'][0]['parts'][0]['text'];

        return str_contains($prompt, 'Senior PHP developer with Laravel experience.')
            && str_contains($prompt, 'My resume with React experience.');
    });
});

it('returns fallback data when Gemini API fails instead of 503', function () {
    Http::preventStrayRequests();

    Http::fake([
        'generativelanguage.googleapis.com/*' => Http::response([], 500),
    ]);

    $response = $this->actingAs($this->user)->postJson(
        route('job-applications.ai-match', $this->application),
        ['resume_text' => 'My resume.'],
    );

    $response->assertSuccessful();
    expect($response->json('_badge'))->toBe('Generated via Smart Analysis (AI provider busy)');
    expect($response->json('match_percentage'))->toBeGreaterThanOrEqual(0);
});

it('returns 422 when job description is missing', function () {
    $applicationWithoutJobDesc = JobApplication::factory()->create([
        'user_id' => $this->user->id,
        'job_description' => null,
    ]);

    $this->actingAs($this->user)->postJson(
        route('job-applications.ai-match', $applicationWithoutJobDesc),
        ['resume_text' => 'Good communicator.'],
    )->assertStatus(422);
});
