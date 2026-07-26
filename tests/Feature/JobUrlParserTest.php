<?php

use App\Models\User;
use Illuminate\Support\Facades\Http;

it('redirects unauthenticated users to login', function () {
    $this->post(route('job-applications.parse-url'), [
        'job_url' => 'https://example.com/job',
    ])->assertRedirect();
});

it('validates job_url is required', function () {
    $this->actingAs(User::factory()->create())
        ->postJson(route('job-applications.parse-url'), [])
        ->assertJsonValidationErrors(['job_url']);
});

it('validates job_url must be a valid URL', function () {
    $this->actingAs(User::factory()->create())
        ->postJson(route('job-applications.parse-url'), [
            'job_url' => 'not-a-url',
        ])
        ->assertJsonValidationErrors(['job_url']);
});

it('extracts OpenGraph metadata zero-token from a job page', function () {
    Http::preventStrayRequests();

    Http::fake([
        'example.com/*' => Http::response(<<<'HTML'
<!DOCTYPE html>
<html>
<head>
<meta property="og:title" content="Senior Laravel Developer" />
<meta property="og:description" content="We are looking for a Senior Laravel Developer to join our team." />
<meta property="og:site_name" content="Acme Corp" />
</head>
<body></body>
</html>
HTML),
    ]);

    $response = $this->actingAs(User::factory()->create())
        ->postJson(route('job-applications.parse-url'), [
            'job_url' => 'https://example.com/job/123',
        ]);

    $response->assertSuccessful()
        ->assertJson([
            'company_name' => 'Acme Corp',
            'job_title' => 'Senior Laravel Developer',
            'job_description' => 'We are looking for a Senior Laravel Developer to join our team.',
            'location' => null,
            'expected_salary' => null,
        ]);
});

it('extracts Schema org JobPosting JSON-LD from a job page', function () {
    Http::preventStrayRequests();

    Http::fake([
        'example.com/*' => Http::response(<<<'HTML'
<!DOCTYPE html>
<html>
<head>
<script type="application/ld+json">
{
    "@context": "https://schema.org",
    "@type": "JobPosting",
    "title": "Software Engineer",
    "description": "Build great software.",
    "hiringOrganization": {
        "@type": "Organization",
        "name": "Tech Corp"
    },
    "jobLocation": {
        "@type": "Place",
        "address": {
            "addressLocality": "Manila",
            "addressRegion": "NCR",
            "addressCountry": "PH"
        }
    },
    "baseSalary": {
        "@type": "MonetaryAmount",
        "value": {
            "@type": "QuantitativeValue",
            "value": 960000,
            "unitText": "YEAR"
        }
    }
}
</script>
</head>
<body></body>
</html>
HTML),
    ]);

    $response = $this->actingAs(User::factory()->create())
        ->postJson(route('job-applications.parse-url'), [
            'job_url' => 'https://example.com/job/456',
        ]);

    $response->assertSuccessful()
        ->assertJson([
            'company_name' => 'Tech Corp',
            'job_title' => 'Software Engineer',
            'job_description' => 'Build great software.',
            'location' => 'Manila, NCR, PH',
            'expected_salary' => 960000,
        ]);
});

it('falls back to Gemini when OpenGraph and Schema metadata are incomplete', function () {
    Http::preventStrayRequests();

    Http::fake([
        'example.com/*' => Http::response(<<<'HTML'
<!DOCTYPE html>
<html>
<head><title>Some Page</title></head>
<body>
<h1>Senior PHP Developer at FooBar Inc.</h1>
<p>We are hiring a Senior PHP Developer with 5+ years of Laravel experience. Location: Remote. Salary: 1,200,000 PHP/year.</p>
</body>
</html>
HTML),
        'generativelanguage.googleapis.com/*' => Http::response([
            'candidates' => [
                [
                    'content' => [
                        'parts' => [
                            ['text' => '{"company_name": "FooBar Inc.", "job_title": "Senior PHP Developer", "job_description": "We are hiring a Senior PHP Developer with 5+ years of Laravel experience.", "location": "Remote", "expected_salary": 1200000}'],
                        ],
                    ],
                ],
            ],
        ]),
    ]);

    $response = $this->actingAs(User::factory()->create())
        ->postJson(route('job-applications.parse-url'), [
            'job_url' => 'https://example.com/job/789',
        ]);

    $response->assertSuccessful()
        ->assertJson([
            'company_name' => 'FooBar Inc.',
            'job_title' => 'Senior PHP Developer',
            'job_description' => 'We are hiring a Senior PHP Developer with 5+ years of Laravel experience.',
            'location' => 'Remote',
            'expected_salary' => 1200000,
        ]);
});

it('returns partial data from OG when Gemini fallback fails', function () {
    Http::preventStrayRequests();

    Http::fake([
        'example.com/*' => Http::response(<<<'HTML'
<!DOCTYPE html>
<html>
<head>
<meta property="og:site_name" content="Partial Corp" />
<meta property="og:description" content="Some description." />
</head>
<body></body>
</html>
HTML),
        'generativelanguage.googleapis.com/*' => Http::response([], 500),
    ]);

    $response = $this->actingAs(User::factory()->create())
        ->postJson(route('job-applications.parse-url'), [
            'job_url' => 'https://example.com/job/fallback-fail',
        ]);

    $response->assertSuccessful()
        ->assertJson([
            'company_name' => 'Partial Corp',
            'job_title' => null,
            'job_description' => 'Some description.',
            'location' => null,
            'expected_salary' => null,
        ]);
});

it('returns 422 when the job page cannot be fetched', function () {
    Http::preventStrayRequests();

    Http::fake([
        'example.com/*' => Http::response([], 404),
    ]);

    $response = $this->actingAs(User::factory()->create())
        ->postJson(route('job-applications.parse-url'), [
            'job_url' => 'https://example.com/nonexistent',
        ]);

    $response->assertStatus(422)
        ->assertJson(['message' => 'Failed to fetch the job page. Please check the URL and try again.']);
});

it('prefers Schema org data over OpenGraph when both are present', function () {
    Http::preventStrayRequests();

    Http::fake([
        'example.com/*' => Http::response(<<<'HTML'
<!DOCTYPE html>
<html>
<head>
<meta property="og:title" content="OG Title" />
<meta property="og:site_name" content="OG Corp" />
<script type="application/ld+json">
{
    "@context": "https://schema.org",
    "@type": "JobPosting",
    "title": "Schema Title",
    "hiringOrganization": {"name": "Schema Corp"}
}
</script>
</head>
<body></body>
</html>
HTML),
    ]);

    $response = $this->actingAs(User::factory()->create())
        ->postJson(route('job-applications.parse-url'), [
            'job_url' => 'https://example.com/job/prefer-schema',
        ]);

    $response->assertSuccessful()
        ->assertJson([
            'company_name' => 'Schema Corp',
            'job_title' => 'Schema Title',
        ]);
});
