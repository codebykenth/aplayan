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
        'job_title' => 'Senior PHP Developer',
        'location' => 'Manila',
        'job_description' => 'Laravel developer with 5 years experience.',
    ]);
});

it('redirects unauthenticated users to login', function () {
    $this->post(route('job-applications.ai-salary', $this->application))->assertRedirect();
});

it('returns 403 when checking salary for another users application', function () {
    $this->actingAs($this->otherUser)
        ->postJson(route('job-applications.ai-salary', $this->application))
        ->assertForbidden();
});

it('estimates salary and saves AI fields to the database', function () {
    Http::preventStrayRequests();

    Http::fake([
        'generativelanguage.googleapis.com/*' => Http::response([
            'candidates' => [
                [
                    'content' => [
                        'parts' => [
                            ['text' => '{"min_salary_php": 600000, "max_salary_php": 900000, "market_context": "Senior PHP developers in Manila earn between ₱600,000 and ₱900,000 annually based on current market data."}'],
                        ],
                    ],
                ],
            ],
        ]),
    ]);

    $response = $this->actingAs($this->user)->postJson(
        route('job-applications.ai-salary', $this->application),
    );

    $response->assertSuccessful()
        ->assertJsonStructure([
            'salary_min',
            'salary_max',
            'salary_notes',
            'evaluated_at',
        ]);

    expect($response->json('salary_min'))->toBe(600000);
    expect($response->json('salary_max'))->toBe(900000);
    expect($response->json('salary_notes'))->toBeString();

    $this->assertDatabaseHas('job_applications', [
        'id' => $this->application->id,
        'ai_salary_min' => 600000,
        'ai_salary_max' => 900000,
    ]);

    $fresh = $this->application->fresh();
    expect($fresh->ai_salary_notes)->not->toBeNull();
    expect($fresh->ai_evaluated_at)->not->toBeNull();
});

it('sends job title, location, and job description to Gemini', function () {
    Http::preventStrayRequests();

    Http::fake([
        'generativelanguage.googleapis.com/*' => Http::response([
            'candidates' => [
                [
                    'content' => [
                        'parts' => [
                            ['text' => '{"min_salary_php": 500000, "max_salary_php": 800000, "market_context": "Test market."}'],
                        ],
                    ],
                ],
            ],
        ]),
    ]);

    $this->actingAs($this->user)->postJson(
        route('job-applications.ai-salary', $this->application),
    );

    Http::assertSent(function (Request $request) {
        $body = json_decode($request->body(), true);
        $prompt = $body['contents'][0]['parts'][0]['text'];

        return str_contains($prompt, 'Senior PHP Developer')
            && str_contains($prompt, 'Manila')
            && str_contains($prompt, 'Laravel developer with 5 years experience.');
    });
});

it('works without job description', function () {
    Http::preventStrayRequests();

    $applicationWithoutDesc = JobApplication::factory()->create([
        'user_id' => $this->user->id,
        'job_title' => 'Junior Developer',
        'location' => 'Cebu',
        'job_description' => null,
    ]);

    Http::fake([
        'generativelanguage.googleapis.com/*' => Http::response([
            'candidates' => [
                [
                    'content' => [
                        'parts' => [
                            ['text' => '{"min_salary_php": 300000, "max_salary_php": 480000, "market_context": "Entry-level developers in Cebu."}'],
                        ],
                    ],
                ],
            ],
        ]),
    ]);

    $response = $this->actingAs($this->user)->postJson(
        route('job-applications.ai-salary', $applicationWithoutDesc),
    );

    $response->assertSuccessful();
    expect($response->json('salary_min'))->toBe(300000);
});

it('returns fallback data when Gemini API fails instead of 503', function () {
    Http::preventStrayRequests();

    Http::fake([
        'generativelanguage.googleapis.com/*' => Http::response([], 500),
    ]);

    $response = $this->actingAs($this->user)->postJson(
        route('job-applications.ai-salary', $this->application),
    );

    $response->assertSuccessful();
    expect($response->json('_badge'))->toBe('Generated via Smart Analysis (AI provider busy)');
});

it('updates ai_evaluated_at timestamp on each check', function () {
    Http::preventStrayRequests();

    Http::fake([
        'generativelanguage.googleapis.com/*' => Http::response([
            'candidates' => [
                [
                    'content' => [
                        'parts' => [
                            ['text' => '{"min_salary_php": 600000, "max_salary_php": 900000, "market_context": "Market context."}'],
                        ],
                    ],
                ],
            ],
        ]),
    ]);

    expect($this->application->ai_evaluated_at)->toBeNull();

    $this->actingAs($this->user)->postJson(
        route('job-applications.ai-salary', $this->application),
    );

    $fresh = $this->application->fresh();
    expect($fresh->ai_evaluated_at)->not->toBeNull();
});
