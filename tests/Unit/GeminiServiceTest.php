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
                            ['text' => '{"match_percentage": 85, "tech_stack_percentage": 90, "experience_percentage": 80, "education_percentage": 75, "strengths": ["Strong communication", "Technical leadership"], "gaps": ["No Python experience", "Limited cloud architecture"]}'],
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
        'tech_stack_percentage' => 90,
        'experience_percentage' => 80,
        'education_percentage' => 75,
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
                            ['text' => '{"match_percentage": 75, "tech_stack_percentage": 70, "experience_percentage": 75, "education_percentage": 80, "strengths": [], "gaps": []}'],
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

it('polishes a resume summary section', function () {
    Http::preventStrayRequests();

    Http::fake([
        'generativelanguage.googleapis.com/*' => Http::response([
            'candidates' => [
                [
                    'content' => [
                        'parts' => [
                            ['text' => 'Senior software engineer with 8+ years of experience delivering scalable solutions.'],
                        ],
                    ],
                ],
            ],
        ]),
    ]);

    $service = app(GeminiService::class);
    $result = $service->polishResumeSection('summary', 'Senior software engineer with 8+ years experience.');

    expect($result)->toBeString();
    expect($result)->toContain('Senior');
});

it('polishes a work experience description', function () {
    Http::preventStrayRequests();

    Http::fake([
        'generativelanguage.googleapis.com/*' => Http::response([
            'candidates' => [
                [
                    'content' => [
                        'parts' => [
                            ['text' => 'Led development of microservices architecture improving deployment frequency by 40%.'],
                        ],
                    ],
                ],
            ],
        ]),
    ]);

    $service = app(GeminiService::class);
    $result = $service->polishResumeSection('work_experience', 'Led development of microservices.');

    expect($result)->toBeString();
});

it('polishes a project description', function () {
    Http::preventStrayRequests();

    Http::fake([
        'generativelanguage.googleapis.com/*' => Http::response([
            'candidates' => [
                [
                    'content' => [
                        'parts' => [
                            ['text' => 'Built a full-stack e-commerce platform serving 10k+ monthly users.'],
                        ],
                    ],
                ],
            ],
        ]),
    ]);

    $service = app(GeminiService::class);
    $result = $service->polishResumeSection('projects', 'Built an e-commerce platform.');

    expect($result)->toBeString();
});

it('improves a cover letter with polish preset', function () {
    Http::preventStrayRequests();

    Http::fake([
        'generativelanguage.googleapis.com/*' => Http::response([
            'candidates' => [
                [
                    'content' => [
                        'parts' => [
                            ['text' => 'I am writing to express my interest in the position at your company.'],
                        ],
                    ],
                ],
            ],
        ]),
    ]);

    $service = app(GeminiService::class);
    $result = $service->improveCoverLetter('I am writing to express my interest.', 'polish');

    expect($result)->toBeString();
});

it('makes a cover letter more concise', function () {
    Http::preventStrayRequests();

    Http::fake([
        'generativelanguage.googleapis.com/*' => Http::response([
            'candidates' => [
                [
                    'content' => [
                        'parts' => [
                            ['text' => 'Interested in the position. Strong background in PHP and React.'],
                        ],
                    ],
                ],
            ],
        ]),
    ]);

    $service = app(GeminiService::class);
    $result = $service->improveCoverLetter('I am very interested in the position at your company.', 'concise');

    expect($result)->toBeString();
});

it('makes a cover letter more formal', function () {
    Http::preventStrayRequests();

    Http::fake([
        'generativelanguage.googleapis.com/*' => Http::response([
            'candidates' => [
                [
                    'content' => [
                        'parts' => [
                            ['text' => 'I hereby submit my application for the position of Software Engineer.'],
                        ],
                    ],
                ],
            ],
        ]),
    ]);

    $service = app(GeminiService::class);
    $result = $service->improveCoverLetter('I want to apply for the software engineer job.', 'formal');

    expect($result)->toBeString();
});
