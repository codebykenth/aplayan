<?php

use App\Models\ResumeProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->user = User::factory()->create();
});

it('creates a resume profile', function () {
    $profile = ResumeProfile::factory()->create(['user_id' => $this->user->id]);

    expect($profile)->toBeInstanceOf(ResumeProfile::class);
    expect($profile->user_id)->toBe($this->user->id);
});

it('retrieves profile for a user', function () {
    ResumeProfile::factory()->create(['user_id' => $this->user->id]);

    $profile = ResumeProfile::where('user_id', $this->user->id)->first();

    expect($profile)->not->toBeNull();
    expect($profile->user_id)->toBe($this->user->id);
});

it('returns null when user has no profile', function () {
    $profile = ResumeProfile::where('user_id', $this->user->id)->first();

    expect($profile)->toBeNull();
});

it('casts JSON fields correctly', function () {
    $profile = ResumeProfile::factory()->create([
        'user_id' => $this->user->id,
        'work_experience' => [['company' => 'Acme', 'position' => 'Dev']],
        'education' => [['institution' => 'UP Diliman']],
        'skills' => ['PHP', 'Laravel'],
        'certifications' => ['AWS'],
    ]);

    expect($profile->work_experience)->toBeArray();
    expect($profile->education)->toBeArray();
    expect($profile->skills)->toBeArray();
    expect($profile->certifications)->toBeArray();
});

it('defaults JSON fields to empty arrays', function () {
    $profile = ResumeProfile::factory()->create([
        'user_id' => $this->user->id,
        'work_experience' => [],
        'education' => [],
        'skills' => [],
        'certifications' => [],
    ]);

    expect($profile->work_experience)->toBe([]);
    expect($profile->education)->toBe([]);
    expect($profile->skills)->toBe([]);
    expect($profile->certifications)->toBe([]);
});

it('belongs to a user', function () {
    $profile = ResumeProfile::factory()->create(['user_id' => $this->user->id]);

    expect($profile->user)->toBeInstanceOf(User::class);
    expect($profile->user->id)->toBe($this->user->id);
});
