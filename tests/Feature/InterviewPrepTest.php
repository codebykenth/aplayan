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
        'status' => 'interviewing',
    ]);
});

it('redirects unauthenticated users to login', function () {
    $this->post(route('job-applications.interview-prep', $this->application))->assertRedirect();
});

it('returns 403 when prepping another users application', function () {
    $this->actingAs($this->otherUser)
        ->postJson(route('job-applications.interview-prep', $this->application))
        ->assertForbidden();
});

it('generates interview prep and returns AI content', function () {
    Http::preventStrayRequests();

    Http::fake([
        'generativelanguage.googleapis.com/*' => Http::response([
            'candidates' => [
                [
                    'content' => [
                        'parts' => [
                            ['text' => '{"questions": ["Tell me about your Laravel experience", "How do you handle security in PHP applications?"], "talking_points": ["Emphasize your experience with Laravel 13", "Highlight your knowledge of PHP security best practices"], "tips": ["Prepare specific examples from past projects", "Be ready to discuss PHP 8.4 features you have used"]}'],
                        ],
                    ],
                ],
            ],
        ]),
    ]);

    $response = $this->actingAs($this->user)->postJson(
        route('job-applications.interview-prep', $this->application),
    );

    $response->assertSuccessful()
        ->assertJsonStructure([
            'questions',
            'talking_points',
            'tips',
        ]);

    expect($response->json('questions'))->toBeArray()->toHaveCount(2);
    expect($response->json('talking_points'))->toBeArray()->toHaveCount(2);
    expect($response->json('tips'))->toBeArray()->toHaveCount(2);

    $this->assertDatabaseHas('job_applications', [
        'id' => $this->application->id,
        'ai_interview_prep' => json_encode([
            'questions' => ['Tell me about your Laravel experience', 'How do you handle security in PHP applications?'],
            'talking_points' => ['Emphasize your experience with Laravel 13', 'Highlight your knowledge of PHP security best practices'],
            'tips' => ['Prepare specific examples from past projects', 'Be ready to discuss PHP 8.4 features you have used'],
        ]),
    ]);
});

it('stores interview prep results on the application record', function () {
    Http::preventStrayRequests();

    Http::fake([
        'generativelanguage.googleapis.com/*' => Http::response([
            'candidates' => [
                [
                    'content' => [
                        'parts' => [
                            ['text' => '{"questions": ["Q1"], "talking_points": ["TP1"], "tips": ["T1"]}'],
                        ],
                    ],
                ],
            ],
        ]),
    ]);

    $this->actingAs($this->user)->postJson(
        route('job-applications.interview-prep', $this->application),
    );

    $fresh = $this->application->fresh();
    expect($fresh->ai_interview_prep)->toBeArray();
    expect($fresh->ai_interview_prep['questions'])->toBe(['Q1']);
    expect($fresh->ai_interview_prep['talking_points'])->toBe(['TP1']);
    expect($fresh->ai_interview_prep['tips'])->toBe(['T1']);
});

it('passes the job description to Gemini', function () {
    Http::preventStrayRequests();

    Http::fake([
        'generativelanguage.googleapis.com/*' => Http::response([
            'candidates' => [
                [
                    'content' => [
                        'parts' => [
                            ['text' => '{"questions": [], "talking_points": [], "tips": []}'],
                        ],
                    ],
                ],
            ],
        ]),
    ]);

    $this->actingAs($this->user)->postJson(
        route('job-applications.interview-prep', $this->application),
    );

    Http::assertSent(function (Request $request) {
        $body = json_decode($request->body(), true);
        $prompt = $body['contents'][0]['parts'][0]['text'];

        return str_contains($prompt, 'Senior PHP developer with Laravel experience.');
    });
});

it('returns 500 when AI response cannot be parsed', function () {
    Http::preventStrayRequests();

    Http::fake([
        'generativelanguage.googleapis.com/*' => Http::response([
            'candidates' => [
                [
                    'content' => [
                        'parts' => [
                            ['text' => 'invalid json'],
                        ],
                    ],
                ],
            ],
        ]),
    ]);

    $response = $this->actingAs($this->user)->postJson(
        route('job-applications.interview-prep', $this->application),
    );

    $response->assertStatus(500);
});

it('returns 503 when Gemini API fails', function () {
    Http::preventStrayRequests();

    Http::fake([
        'generativelanguage.googleapis.com/*' => Http::response([], 500),
    ]);

    $response = $this->actingAs($this->user)->postJson(
        route('job-applications.interview-prep', $this->application),
    );

    $response->assertStatus(503);
    expect($response->json('message'))->toBe('AI service is temporarily unavailable.');
});

it('works without a job description (empty string fallback)', function () {
    Http::preventStrayRequests();

    $applicationWithoutJobDesc = JobApplication::factory()->create([
        'user_id' => $this->user->id,
        'job_description' => null,
        'status' => 'interviewing',
    ]);

    Http::fake([
        'generativelanguage.googleapis.com/*' => Http::response([
            'candidates' => [
                [
                    'content' => [
                        'parts' => [
                            ['text' => '{"questions": ["Q"], "talking_points": ["TP"], "tips": ["T"]}'],
                        ],
                    ],
                ],
            ],
        ]),
    ]);

    $response = $this->actingAs($this->user)->postJson(
        route('job-applications.interview-prep', $applicationWithoutJobDesc),
    );

    $response->assertSuccessful();
    expect($response->json('questions'))->toBe(['Q']);
});
