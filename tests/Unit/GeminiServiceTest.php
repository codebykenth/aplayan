<?php

use App\Services\GeminiService;
use Illuminate\Http\Client\Request;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;

it('analyzes resume match and returns structured result', function () {
    Http::preventStrayRequests();

    Http::fake([
        'generativelanguage.googleapis.com/*' => Http::response([
            'candidates' => [
                [
                    'content' => [
                        'parts' => [
                            ['text' => '{"match_percentage": 85, "strengths": ["Strong communication", "Technical leadership"], "gaps": ["No Python experience", "Limited cloud architecture"]}'],
                        ],
                    ],
                ],
            ],
        ]),
    ]);

    $service = app(GeminiService::class);
    $result = $service->analyzeResumeMatch(
        'Senior software engineer role',
        '5 years experience in PHP, team lead',
    );

    expect($result)->toEqual([
        'match_percentage' => 85,
        'strengths' => ['Strong communication', 'Technical leadership'],
        'gaps' => ['No Python experience', 'Limited cloud architecture'],
    ]);
});

it('estimates salary with full details and returns structured result', function () {
    Http::preventStrayRequests();

    Http::fake([
        'generativelanguage.googleapis.com/*' => Http::response([
            'candidates' => [
                [
                    'content' => [
                        'parts' => [
                            ['text' => '{"min_salary_php": 120000, "max_salary_php": 180000, "market_context": "Senior engineers in San Francisco typically earn between $120k and $180k based on current market data."}'],
                        ],
                    ],
                ],
            ],
        ]),
    ]);

    $service = app(GeminiService::class);
    $result = $service->estimateSalary(
        'Senior Software Engineer',
        'San Francisco, CA',
        'Full-stack role with React and Node.js',
    );

    expect($result)->toEqual([
        'min_salary_php' => 120000,
        'max_salary_php' => 180000,
        'market_context' => 'Senior engineers in San Francisco typically earn between $120k and $180k based on current market data.',
    ]);
});

it('estimates salary without job description', function () {
    Http::preventStrayRequests();

    Http::fake([
        'generativelanguage.googleapis.com/*' => Http::response([
            'candidates' => [
                [
                    'content' => [
                        'parts' => [
                            ['text' => '{"min_salary_php": 90000, "max_salary_php": 130000, "market_context": "Average salary range for this title in this location."}'],
                        ],
                    ],
                ],
            ],
        ]),
    ]);

    $service = app(GeminiService::class);
    $result = $service->estimateSalary('Software Engineer', 'Austin, TX', null);

    expect($result)->toEqual([
        'min_salary_php' => 90000,
        'max_salary_php' => 130000,
        'market_context' => 'Average salary range for this title in this location.',
    ]);
});

it('sends the correct request payload to Gemini API', function () {
    Http::preventStrayRequests();

    Http::fake([
        'generativelanguage.googleapis.com/*' => Http::response([
            'candidates' => [
                [
                    'content' => [
                        'parts' => [
                            ['text' => '{"match_percentage": 75, "strengths": [], "gaps": []}'],
                        ],
                    ],
                ],
            ],
        ]),
    ]);

    $service = app(GeminiService::class);
    $service->analyzeResumeMatch('Job description', 'Resume text');

    Http::assertSent(function (Request $request) {
        $body = json_decode($request->body(), true);

        if (! isset($body['contents'][0]['parts'][0]['text'])) {
            return false;
        }

        $prompt = $body['contents'][0]['parts'][0]['text'];

        return str_contains($prompt, 'Job description')
            && str_contains($prompt, 'Resume text')
            && str_contains($prompt, 'match_percentage');
    });
});

it('throws exception on HTTP failure', function () {
    Http::preventStrayRequests();

    Http::fake([
        'generativelanguage.googleapis.com/*' => Http::response([], 500),
    ]);

    $service = app(GeminiService::class);

    $service->analyzeResumeMatch('Job', 'Resume');
})->throws(RequestException::class);

it('throws exception on invalid JSON response', function () {
    Http::preventStrayRequests();

    Http::fake([
        'generativelanguage.googleapis.com/*' => Http::response([
            'candidates' => [
                [
                    'content' => [
                        'parts' => [
                            ['text' => 'not valid json'],
                        ],
                    ],
                ],
            ],
        ]),
    ]);

    $service = app(GeminiService::class);

    $service->analyzeResumeMatch('Job', 'Resume');
})->throws(JsonException::class);
