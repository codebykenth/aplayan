<?php

use App\Models\ResumeProfile;
use App\Models\User;

beforeEach(function () {
    $this->user = User::factory()->create();
});

it('saves a profile with ats_single_column template', function () {
    $response = $this->actingAs($this->user)->putJson(route('documents.profile.update'), [
        'full_name' => 'Juan Dela Cruz',
        'email' => 'juan@example.com',
        'phone' => '+63 917 123 4567',
        'location' => 'Metro Manila',
        'target_role' => 'Software Developer',
        'work_experience' => [],
        'education' => [],
        'skills' => [],
        'certifications' => [],
    ]);

    $response->assertRedirect(route('documents.index'));
    $this->assertDatabaseHas('resume_profiles', [
        'user_id' => $this->user->id,
        'full_name' => 'Juan Dela Cruz',
    ]);
});

it('saves additional_info on resume profile', function () {
    $additionalInfo = [
        ['label' => 'Languages', 'value' => 'English, Filipino, Japanese'],
        ['label' => 'Certifications of Completion', 'value' => 'Laravel Advanced Training 2025'],
    ];

    $response = $this->actingAs($this->user)->putJson(route('documents.profile.update'), [
        'full_name' => 'Juan Dela Cruz',
        'email' => 'juan@example.com',
        'phone' => '+63 917 123 4567',
        'location' => 'Metro Manila',
        'additional_info' => $additionalInfo,
    ]);

    $response->assertRedirect(route('documents.index'));
    $profile = ResumeProfile::where('user_id', $this->user->id)->first();
    expect($profile->additional_info)->toBe($additionalInfo);
});

it('validates additional_info is an array', function () {
    $response = $this->actingAs($this->user)->putJson(route('documents.profile.update'), [
        'full_name' => 'Juan',
        'email' => 'juan@example.com',
        'phone' => '+63 917 123 4567',
        'location' => 'Metro Manila',
        'additional_info' => 'not-an-array',
    ]);

    $response->assertJsonValidationErrors(['additional_info']);
});

it('saves project with duration field', function () {
    $response = $this->actingAs($this->user)->putJson(route('documents.profile.update'), [
        'full_name' => 'Juan Dela Cruz',
        'email' => 'juan@example.com',
        'phone' => '+63 917 123 4567',
        'location' => 'Metro Manila',
        'projects' => [
            [
                'title' => 'E-commerce Platform',
                'description' => 'Built a full-stack platform.',
                'url' => 'https://example.com',
                'github_url' => '',
                'technologies' => 'Laravel, React',
                'duration' => 'February 2026 - Present',
            ],
        ],
    ]);

    $response->assertRedirect(route('documents.index'));
    $profile = ResumeProfile::where('user_id', $this->user->id)->first();
    expect($profile->projects[0]['duration'])->toBe('February 2026 - Present');
});

it('validates projects is an array', function () {
    $response = $this->actingAs($this->user)->putJson(route('documents.profile.update'), [
        'full_name' => 'Juan',
        'email' => 'juan@example.com',
        'phone' => '+63 917 123 4567',
        'location' => 'Metro Manila',
        'projects' => 'not-an-array',
    ]);

    $response->assertJsonValidationErrors(['projects']);
});

it('saves work experience with location field', function () {
    $response = $this->actingAs($this->user)->putJson(route('documents.profile.update'), [
        'full_name' => 'Juan Dela Cruz',
        'email' => 'juan@example.com',
        'phone' => '+63 917 123 4567',
        'location' => 'Metro Manila',
        'work_experience' => [
            [
                'company' => 'Acme Corp',
                'position' => 'Developer',
                'duration' => '2020 - 2023',
                'description' => 'Built apps.',
                'location' => 'Makati City',
            ],
        ],
    ]);

    $response->assertRedirect(route('documents.index'));
    $profile = ResumeProfile::where('user_id', $this->user->id)->first();
    expect($profile->work_experience[0]['location'])->toBe('Makati City');
});

it('saves education with location field', function () {
    $response = $this->actingAs($this->user)->putJson(route('documents.profile.update'), [
        'full_name' => 'Juan Dela Cruz',
        'email' => 'juan@example.com',
        'phone' => '+63 917 123 4567',
        'location' => 'Metro Manila',
        'education' => [
            [
                'institution' => 'UP Diliman',
                'degree' => 'BS Computer Science',
                'year' => '2020',
                'location' => 'Quezon City',
            ],
        ],
    ]);

    $response->assertRedirect(route('documents.index'));
    $profile = ResumeProfile::where('user_id', $this->user->id)->first();
    expect($profile->education[0]['location'])->toBe('Quezon City');
});

it('allows saving with free-form text dates', function () {
    $response = $this->actingAs($this->user)->putJson(route('documents.profile.update'), [
        'full_name' => 'Juan Dela Cruz',
        'email' => 'juan@example.com',
        'phone' => '+63 917 123 4567',
        'location' => 'Metro Manila',
        'work_experience' => [
            [
                'company' => 'Acme Corp',
                'position' => 'Developer',
                'duration' => '2025-PRESENT',
                'description' => 'Current role.',
            ],
        ],
    ]);

    $response->assertRedirect(route('documents.index'));
    $profile = ResumeProfile::where('user_id', $this->user->id)->first();
    expect($profile->work_experience[0]['duration'])->toBe('2025-PRESENT');
});

it('saves resume with ats_single_column template via save-resume endpoint', function () {
    $response = $this->actingAs($this->user)->post(route('documents.save-resume'), [
        'name' => 'ATS Single Column Resume',
        'template' => 'ats_single_column',
        'profile_data' => [
            'full_name' => 'Juan Dela Cruz',
            'email' => 'juan@example.com',
            'phone' => '+63 917 123 4567',
            'location' => 'Metro Manila',
        ],
    ]);

    $response->assertRedirect(route('documents.saved'));
    $this->assertDatabaseHas('saved_resumes', [
        'user_id' => $this->user->id,
        'template' => 'ats_single_column',
    ]);
});

it('saves resume with ats_classic_serif template via save-resume endpoint', function () {
    $response = $this->actingAs($this->user)->post(route('documents.save-resume'), [
        'name' => 'ATS Classic Serif Resume',
        'template' => 'ats_classic_serif',
        'profile_data' => [
            'full_name' => 'Juan Dela Cruz',
            'email' => 'juan@example.com',
            'phone' => '+63 917 123 4567',
            'location' => 'Metro Manila',
        ],
    ]);

    $response->assertRedirect(route('documents.saved'));
    $this->assertDatabaseHas('saved_resumes', [
        'user_id' => $this->user->id,
        'template' => 'ats_classic_serif',
    ]);
});

it('validates template is one of allowed values including new templates', function () {
    $response = $this->actingAs($this->user)->postJson(route('documents.save-resume'), [
        'name' => 'Test',
        'template' => 'invalid-template',
        'profile_data' => ['full_name' => 'Juan'],
    ]);

    $response->assertJsonValidationErrors(['template']);
});

it('returns additional_info as empty array by default', function () {
    $this->actingAs($this->user)->putJson(route('documents.profile.update'), [
        'full_name' => 'Juan',
        'email' => 'juan@example.com',
        'phone' => '+63 917 123 4567',
        'location' => 'Metro Manila',
    ]);

    $profile = ResumeProfile::where('user_id', $this->user->id)->first();
    expect($profile->additional_info)->toBe([]);
});

it('saves and retrieves categorized skills with bold prefix', function () {
    $response = $this->actingAs($this->user)->putJson(route('documents.profile.update'), [
        'full_name' => 'Juan Dela Cruz',
        'email' => 'juan@example.com',
        'phone' => '+63 917 123 4567',
        'location' => 'Metro Manila',
        'skills' => [
            'Frontend: React, Next.js, TypeScript',
            'Backend: Laravel, PHP, Python',
            'DevOps: Docker, AWS, CI/CD',
        ],
    ]);

    $response->assertRedirect(route('documents.index'));
    $profile = ResumeProfile::where('user_id', $this->user->id)->first();
    expect($profile->skills)->toHaveCount(3);
    expect($profile->skills[0])->toBe('Frontend: React, Next.js, TypeScript');
});
