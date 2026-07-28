<?php

use App\Models\JobApplication;
use App\Models\User;
use Illuminate\Http\UploadedFile;

beforeEach(function () {
    $this->user = User::factory()->create();
    $this->otherUser = User::factory()->create();
});

describe('export', function () {
    it('exports job applications as CSV', function () {
        JobApplication::factory()->count(2)->create([
            'user_id' => $this->user->id,
            'company_name' => 'Acme Corp',
            'job_title' => 'Engineer',
            'status' => 'applied',
            'location' => 'Remote',
            'expected_salary' => 50000,
            'date_applied' => '2024-01-15',
        ]);

        $response = $this->actingAs($this->user)->get(
            route('job-applications.export', ['format' => 'csv']),
        );

        $response->assertSuccessful();
        $response->assertHeader('Content-Type', 'text/csv; charset=utf-8');
        $response->assertHeader('Content-Disposition', 'attachment; filename="job-applications.csv"');

        $csv = $response->content();
        expect($csv)->toContain('Acme Corp');
        expect($csv)->toContain('Engineer,applied,Remote,50000,2024-01-15');
    });

    it('exports job applications as JSON', function () {
        JobApplication::factory()->count(2)->create([
            'user_id' => $this->user->id,
            'company_name' => 'Acme Corp',
            'job_title' => 'Engineer',
            'status' => 'applied',
            'location' => 'Remote',
            'expected_salary' => 50000,
            'date_applied' => '2024-01-15',
        ]);

        $response = $this->actingAs($this->user)->get(
            route('job-applications.export', ['format' => 'json']),
        );

        $response->assertSuccessful();
        $response->assertHeader('Content-Type', 'application/json');
        $response->assertHeader('Content-Disposition', 'attachment; filename="job-applications.json"');

        $data = $response->json();
        expect($data)->toBeArray()
            ->and($data)->toHaveCount(2);
        expect($data[0])->toHaveKey('company_name', 'Acme Corp');
        expect($data[0])->toHaveKey('job_title', 'Engineer');
    });

    it('defaults to CSV format when format is not specified', function () {
        JobApplication::factory()->create([
            'user_id' => $this->user->id,
            'company_name' => 'Acme Corp',
            'job_title' => 'Engineer',
            'status' => 'applied',
            'location' => 'Remote',
        ]);

        $response = $this->actingAs($this->user)->get(route('job-applications.export'));

        $response->assertSuccessful();
        $response->assertHeader('Content-Type', 'text/csv; charset=utf-8');
    });

    it('only exports the authenticated user applications', function () {
        JobApplication::factory()->count(2)->create(['user_id' => $this->user->id]);
        JobApplication::factory()->count(3)->create(['user_id' => $this->otherUser->id]);

        $response = $this->actingAs($this->user)->get(
            route('job-applications.export', ['format' => 'json']),
        );

        $response->assertSuccessful();
        expect($response->json())->toBeArray()
            ->and($response->json())->toHaveCount(2);
    });

    it('returns empty array for JSON export when no applications exist', function () {
        $response = $this->actingAs($this->user)->get(
            route('job-applications.export', ['format' => 'json']),
        );

        $response->assertSuccessful();
        expect($response->json())->toBeArray()
            ->and($response->json())->toHaveCount(0);
    });

    it('redirects unauthenticated users to login for export', function () {
        $this->get(route('job-applications.export'))->assertRedirect();
        $this->get(route('job-applications.export', ['format' => 'json']))->assertRedirect();
    });
});

describe('import', function () {
    it('imports job applications from CSV', function () {
        $csv = "company_name,job_title,status,location,expected_salary,date_applied\n";
        $csv .= "Acme Corp,Software Engineer,applied,Remote,50000,2024-01-15\n";
        $csv .= "Globex,Product Manager,interviewing,Metro Manila,80000,2024-02-20\n";

        $file = UploadedFile::fake()->createWithContent('applications.csv', $csv);

        $response = $this->actingAs($this->user)->post(
            route('job-applications.import'),
            ['file' => $file],
        );

        $response->assertRedirect('/job-applications');
        $this->assertDatabaseCount('job_applications', 2);
        $this->assertDatabaseHas('job_applications', [
            'user_id' => $this->user->id,
            'company_name' => 'Acme Corp',
            'job_title' => 'Software Engineer',
            'status' => 'applied',
            'location' => 'Remote',
            'expected_salary' => 50000,
            'date_applied' => '2024-01-15',
        ]);
        $this->assertDatabaseHas('job_applications', [
            'user_id' => $this->user->id,
            'company_name' => 'Globex',
            'job_title' => 'Product Manager',
            'status' => 'interviewing',
            'location' => 'Metro Manila',
            'expected_salary' => 80000,
            'date_applied' => '2024-02-20',
        ]);
    });

    it('skips rows with invalid status', function () {
        $csv = "company_name,job_title,status,location,expected_salary,date_applied\n";
        $csv .= "Acme Corp,Software Engineer,applied,Remote,50000,2024-01-15\n";
        $csv .= "Bad Co,,invalid-status,,abc,not-a-date\n";

        $file = UploadedFile::fake()->createWithContent('applications.csv', $csv);

        $response = $this->actingAs($this->user)->post(
            route('job-applications.import'),
            ['file' => $file],
        );

        $response->assertRedirect();
        $this->assertDatabaseCount('job_applications', 1);
        $this->assertDatabaseHas('job_applications', [
            'user_id' => $this->user->id,
            'company_name' => 'Acme Corp',
        ]);
    });

    it('skips rows with missing required fields', function () {
        $csv = "company_name,job_title,status,location,expected_salary,date_applied\n";
        $csv .= ",Software Engineer,applied,Remote,50000,2024-01-15\n";
        $csv .= "Acme Corp,,,Remote,50000,2024-01-15\n";

        $file = UploadedFile::fake()->createWithContent('applications.csv', $csv);

        $response = $this->actingAs($this->user)->post(
            route('job-applications.import'),
            ['file' => $file],
        );

        $response->assertRedirect();
        $this->assertDatabaseCount('job_applications', 0);
    });

    it('handles empty CSV file gracefully', function () {
        $csv = "company_name,job_title,status,location,expected_salary,date_applied\n";

        $file = UploadedFile::fake()->createWithContent('applications.csv', $csv);

        $response = $this->actingAs($this->user)->post(
            route('job-applications.import'),
            ['file' => $file],
        );

        $response->assertRedirect();
        $this->assertDatabaseCount('job_applications', 0);
    });

    it('validates that file is required', function () {
        $response = $this->actingAs($this->user)->postJson(
            route('job-applications.import'),
            [],
        );

        $response->assertJsonValidationErrors(['file']);
    });

    it('validates that file is a CSV', function () {
        $file = UploadedFile::fake()->create('document.pdf', 100, 'application/pdf');

        $response = $this->actingAs($this->user)->postJson(
            route('job-applications.import'),
            ['file' => $file],
        );

        $response->assertJsonValidationErrors(['file']);
    });

    it('validates that CSV has required headers', function () {
        $csv = "company,job_title,status\n";
        $csv .= "Acme,Engineer,applied\n";

        $file = UploadedFile::fake()->createWithContent('applications.csv', $csv);

        $response = $this->actingAs($this->user)->postJson(
            route('job-applications.import'),
            ['file' => $file],
        );

        $response->assertJsonValidationErrors(['file']);
    });

    it('only imports applications for the authenticated user', function () {
        $csv = "company_name,job_title,status,location,expected_salary,date_applied\n";
        $csv .= "Acme Corp,Software Engineer,applied,Remote,50000,2024-01-15\n";

        $file = UploadedFile::fake()->createWithContent('applications.csv', $csv);

        $response = $this->actingAs($this->user)->post(
            route('job-applications.import'),
            ['file' => $file],
        );

        $response->assertRedirect();
        $this->assertDatabaseCount('job_applications', 1);
        $this->assertDatabaseHas('job_applications', [
            'user_id' => $this->user->id,
            'company_name' => 'Acme Corp',
        ]);
        expect($this->otherUser->jobApplications()->count())->toBe(0);
    });

    it('only imports JSON applications for the authenticated user', function () {
        $json = json_encode([
            [
                'company_name' => 'Acme Corp',
                'job_title' => 'Software Engineer',
            ],
        ]);

        $file = UploadedFile::fake()->createWithContent('applications.json', $json);

        $response = $this->actingAs($this->user)->post(
            route('job-applications.import'),
            ['file' => $file],
        );

        $response->assertRedirect('/job-applications');
        $this->assertDatabaseCount('job_applications', 1);
        $this->assertDatabaseHas('job_applications', [
            'user_id' => $this->user->id,
            'company_name' => 'Acme Corp',
        ]);
        expect($this->otherUser->jobApplications()->count())->toBe(0);
    });

    it('redirects unauthenticated users to login for import', function () {
        $csv = "company_name,job_title,status,location,expected_salary,date_applied\n";
        $csv .= "Acme Corp,Engineer,applied,Remote,50000,2024-01-15\n";

        $file = UploadedFile::fake()->createWithContent('applications.csv', $csv);

        $this->post(route('job-applications.import'), ['file' => $file])->assertRedirect();
    });

    it('imports applications with optional fields', function () {
        $csv = "company_name,job_title,status,location,expected_salary,date_applied\n";
        $csv .= "Acme Corp,Software Engineer,applied,Remote,50000,2024-01-15\n";

        $file = UploadedFile::fake()->createWithContent('applications.csv', $csv);

        $response = $this->actingAs($this->user)->post(
            route('job-applications.import'),
            ['file' => $file],
        );

        $response->assertRedirect();
        $this->assertDatabaseHas('job_applications', [
            'user_id' => $this->user->id,
            'company_name' => 'Acme Corp',
            'expected_salary' => 50000,
            'date_applied' => '2024-01-15',
        ]);
    });

    it('imports applications without expected_salary or date_applied', function () {
        $csv = "company_name,job_title,status,location,expected_salary,date_applied\n";
        $csv .= "Acme Corp,Engineer,applied,Remote,,\n";

        $file = UploadedFile::fake()->createWithContent('applications.csv', $csv);

        $response = $this->actingAs($this->user)->post(
            route('job-applications.import'),
            ['file' => $file],
        );

        $response->assertRedirect();
        $this->assertDatabaseHas('job_applications', [
            'user_id' => $this->user->id,
            'company_name' => 'Acme Corp',
            'expected_salary' => null,
            'date_applied' => null,
        ]);
    });

    it('imports job applications from JSON with full fields', function () {
        $json = json_encode([
            [
                'company_name' => 'Acme Corp',
                'job_title' => 'Software Engineer',
                'status' => 'applied',
                'location' => 'Remote',
                'expected_salary' => 50000,
                'date_applied' => '2024-01-15',
                'job_url' => 'https://example.com/job1',
                'job_description' => 'Senior role',
                'notes' => 'Applied via referral',
            ],
            [
                'company_name' => 'Globex',
                'job_title' => 'Product Manager',
                'status' => 'interviewing',
                'location' => 'Metro Manila',
                'expected_salary' => 80000,
                'date_applied' => '2024-02-20',
            ],
        ]);

        $file = UploadedFile::fake()->createWithContent('applications.json', $json);

        $response = $this->actingAs($this->user)->post(
            route('job-applications.import'),
            ['file' => $file],
        );

        $response->assertRedirect('/job-applications');
        $this->assertDatabaseCount('job_applications', 2);
        $this->assertDatabaseHas('job_applications', [
            'user_id' => $this->user->id,
            'company_name' => 'Acme Corp',
            'job_title' => 'Software Engineer',
            'status' => 'applied',
            'location' => 'Remote',
            'expected_salary' => 50000,
            'date_applied' => '2024-01-15',
            'job_url' => 'https://example.com/job1',
            'job_description' => 'Senior role',
            'notes' => 'Applied via referral',
        ]);
        $this->assertDatabaseHas('job_applications', [
            'user_id' => $this->user->id,
            'company_name' => 'Globex',
            'job_title' => 'Product Manager',
            'status' => 'interviewing',
            'location' => 'Metro Manila',
            'expected_salary' => 80000,
            'date_applied' => '2024-02-20',
        ]);
    });

    it('imports JSON with minimal required fields using smart defaults', function () {
        $json = json_encode([
            [
                'company_name' => 'Acme Corp',
                'job_title' => 'Software Engineer',
            ],
        ]);

        $file = UploadedFile::fake()->createWithContent('applications.json', $json);

        $response = $this->actingAs($this->user)->post(
            route('job-applications.import'),
            ['file' => $file],
        );

        $response->assertRedirect('/job-applications');
        $this->assertDatabaseCount('job_applications', 1);
        $this->assertDatabaseHas('job_applications', [
            'user_id' => $this->user->id,
            'company_name' => 'Acme Corp',
            'job_title' => 'Software Engineer',
            'status' => 'wishlist',
            'location' => 'Remote',
        ]);
    });

    it('validates JSON syntax and returns errors for invalid JSON', function () {
        $invalidJson = '{ "company_name": "Acme", "job_title": "Engineer"'; // Missing closing brace

        $file = UploadedFile::fake()->createWithContent('applications.json', $invalidJson);

        $response = $this->actingAs($this->user)->postJson(
            route('job-applications.import'),
            ['file' => $file],
        );

        $response->assertJsonValidationErrors(['file']);
    });

    it('validates JSON array structure and returns errors for non-array', function () {
        $json = json_encode(['company_name' => 'Acme', 'job_title' => 'Engineer']);

        $file = UploadedFile::fake()->createWithContent('applications.json', $json);

        $response = $this->actingAs($this->user)->postJson(
            route('job-applications.import'),
            ['file' => $file],
        );

        $response->assertJsonValidationErrors(['file']);
    });

    it('validates JSON objects have required fields', function () {
        $json = json_encode([
            ['company_name' => 'Acme'], // Missing job_title
        ]);

        $file = UploadedFile::fake()->createWithContent('applications.json', $json);

        $response = $this->actingAs($this->user)->postJson(
            route('job-applications.import'),
            ['file' => $file],
        );

        $response->assertJsonValidationErrors(['file']);
    });

    it('imports JSON with optional fields job_url, job_description, and notes', function () {
        $json = json_encode([
            [
                'company_name' => 'Acme Corp',
                'job_title' => 'Software Engineer',
                'job_url' => 'https://example.com/job',
                'job_description' => 'Senior role with benefits',
                'notes' => 'Remote position',
            ],
        ]);

        $file = UploadedFile::fake()->createWithContent('applications.json', $json);

        $response = $this->actingAs($this->user)->post(
            route('job-applications.import'),
            ['file' => $file],
        );

        $response->assertRedirect('/job-applications');
        $this->assertDatabaseHas('job_applications', [
            'user_id' => $this->user->id,
            'company_name' => 'Acme Corp',
            'job_url' => 'https://example.com/job',
            'job_description' => 'Senior role with benefits',
            'notes' => 'Remote position',
        ]);
    });

    it('imports CSV with optional fields job_url, job_description, and notes', function () {
        $csv = "company_name,job_title,status,location,expected_salary,date_applied,job_url,job_description,notes\n";
        $csv .= "Acme Corp,Software Engineer,applied,Remote,50000,2024-01-15,https://example.com/job,Senior role,Applied via referral\n";

        $file = UploadedFile::fake()->createWithContent('applications.csv', $csv);

        $response = $this->actingAs($this->user)->post(
            route('job-applications.import'),
            ['file' => $file],
        );

        $response->assertRedirect('/job-applications');
        $this->assertDatabaseHas('job_applications', [
            'user_id' => $this->user->id,
            'company_name' => 'Acme Corp',
            'job_url' => 'https://example.com/job',
            'job_description' => 'Senior role',
            'notes' => 'Applied via referral',
        ]);
    });

    it('accepts JSON file extension for import', function () {
        $json = json_encode([
            [
                'company_name' => 'Acme Corp',
                'job_title' => 'Software Engineer',
            ],
        ]);

        $file = UploadedFile::fake()->createWithContent('applications.json', $json);

        $response = $this->actingAs($this->user)->post(
            route('job-applications.import'),
            ['file' => $file],
        );

        $response->assertRedirect('/job-applications');
        $this->assertDatabaseCount('job_applications', 1);
    });
});
