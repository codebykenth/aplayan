<?php

use App\Services\AiFallbackService;

beforeEach(function () {
    $this->fallback = new AiFallbackService;
});

it('computes a fallback job match score with keyword intersection', function () {
    $jobDescription = 'Looking for a Senior PHP Developer with Laravel experience';
    $resumeText = 'Experienced PHP developer with Laravel skills';

    $result = $this->fallback->computeJobMatchScore($jobDescription, $resumeText);

    expect($result)->toHaveKeys(['match_percentage', 'strengths', 'gaps', '_fallback', '_badge']);
    expect($result['match_percentage'])->toBeInt();
    expect($result['match_percentage'])->toBeGreaterThanOrEqual(0);
    expect($result['match_percentage'])->toBeLessThanOrEqual(100);
    expect($result['_fallback'])->toBeTrue();
    expect($result['_badge'])->toBe('Generated via Smart Analysis (AI provider busy)');
});

it('returns 0 match for completely different content', function () {
    $result = $this->fallback->computeJobMatchScore(
        'Looking for a Senior PHP Developer with Laravel experience',
        'Nothing about this is related to any job skills',
    );

    expect($result['match_percentage'])->toBe(0);
});

it('returns strengths for matched keywords', function () {
    $result = $this->fallback->computeJobMatchScore(
        'Senior PHP Developer Laravel',
        'PHP Laravel development',
    );

    expect($result['strengths'])->toBeArray();
    expect(collect($result['strengths'])->first(fn ($s) => str_contains(strtolower($s), 'php')))->not->toBeNull();
});

it('returns gaps for missing keywords', function () {
    $result = $this->fallback->computeJobMatchScore(
        'Senior PHP Developer Laravel AWS Docker',
        'PHP Laravel development',
    );

    expect($result['gaps'])->toBeArray();
    expect(collect($result['gaps'])->first(fn ($g) => str_contains(strtolower($g), 'aws')))->not->toBeNull();
    expect(collect($result['gaps'])->first(fn ($g) => str_contains(strtolower($g), 'docker')))->not->toBeNull();
});

it('polishes text by normalizing whitespace and adding badge', function () {
    $result = $this->fallback->polishText('Experienced   developer   with   skills.');

    expect($result)->toContain('Experienced developer with skills.');
    expect($result)->toContain('Polished via Smart Analysis (AI provider busy)');
});

it('ignores stop words in keyword matching', function () {
    $result = $this->fallback->computeJobMatchScore(
        'the a an and or for of in on at to by from as is it be',
        'the a an and or for of in on at to by from as is it be',
    );

    expect($result['match_percentage'])->toBe(0);
});

it('handles empty input gracefully', function () {
    $result = $this->fallback->computeJobMatchScore('', '');

    expect($result['match_percentage'])->toBe(0);
    expect($result['strengths'])->toBeArray();
    expect($result['gaps'])->toBeArray();
});
