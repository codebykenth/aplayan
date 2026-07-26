<?php

use App\Models\JobApplication;
use App\Models\User;
use Illuminate\Support\Facades\Schema;

it('has job_applications table with expected columns', function () {
    expect(Schema::hasTable('job_applications'))->toBeTrue();

    expect(Schema::hasColumns('job_applications', [
        'id',
        'user_id',
        'company_name',
        'job_title',
        'job_url',
        'job_description',
        'location',
        'status',
        'date_applied',
        'expected_salary',
        'offered_salary',
        'notes',
        'ai_match_percentage',
        'ai_strengths',
        'ai_gaps',
        'ai_salary_min',
        'ai_salary_max',
        'ai_salary_notes',
        'ai_evaluated_at',
        'created_at',
        'updated_at',
    ]))->toBeTrue();
});

it('belongs to a user', function () {
    $user = User::factory()->create();
    $application = JobApplication::factory()->create(['user_id' => $user->id]);

    expect($application->user)->toBeInstanceOf(User::class)
        ->and($application->user->id)->toBe($user->id);
});

it('user has many job applications', function () {
    $user = User::factory()->create();
    JobApplication::factory()->count(3)->create(['user_id' => $user->id]);

    expect($user->jobApplications)->toHaveCount(3)
        ->and($user->jobApplications->first())->toBeInstanceOf(JobApplication::class);
});

it('scopes job applications to the owning user', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();

    $own = JobApplication::factory()->create(['user_id' => $user->id]);
    JobApplication::factory()->create(['user_id' => $otherUser->id]);

    expect(JobApplication::whereBelongsTo($user)->get())->toHaveCount(1)
        ->and(JobApplication::whereBelongsTo($user)->first()->id)->toBe($own->id);
});

it('has fillable attributes for mass assignment', function () {
    $application = JobApplication::factory()->create();

    $fillable = $application->getFillable();

    expect($fillable)->toContain('company_name', 'job_title', 'job_url', 'job_description');
    expect($fillable)->toContain('location', 'status', 'date_applied');
    expect($fillable)->toContain('expected_salary', 'offered_salary', 'notes');
    expect($fillable)->toContain('ai_match_percentage', 'ai_strengths', 'ai_gaps');
    expect($fillable)->toContain('ai_salary_min', 'ai_salary_max', 'ai_salary_notes', 'ai_evaluated_at');
});

it('casts status to string', function () {
    $application = JobApplication::factory()->create(['status' => 'wishlist']);

    expect($application->status)->toBeString();
});

it('casts json fields to array', function () {
    $application = JobApplication::factory()->create([
        'ai_strengths' => ['strong communication', 'technical skills'],
        'ai_gaps' => ['lack of experience'],
    ]);

    expect($application->ai_strengths)->toBeArray()
        ->and($application->ai_gaps)->toBeArray()
        ->and($application->ai_strengths)->toContain('strong communication', 'technical skills')
        ->and($application->ai_gaps)->toContain('lack of experience');
});

it('allows valid status values', function (string $status) {
    $application = JobApplication::factory()->create(['status' => $status]);

    expect($application->status)->toBe($status);
})->with(['wishlist', 'applied', 'interviewing', 'offer', 'rejected']);

it('can be created via factory', function () {
    $application = JobApplication::factory()->create();

    expect($application)->toBeInstanceOf(JobApplication::class)
        ->and($application->exists)->toBeTrue();
});
