<?php

use App\Services\AiEntityNormalizer;

beforeEach(function () {
    $this->normalizer = new AiEntityNormalizer;
});

it('normalizes company names by stripping regional suffixes', function () {
    expect($this->normalizer->normalizeCompany('Canva Philippines Inc.'))->toBe('canva');
    expect($this->normalizer->normalizeCompany('Google Inc.'))->toBe('google');
    expect($this->normalizer->normalizeCompany('Microsoft Corp'))->toBe('microsoft');
    expect($this->normalizer->normalizeCompany('Acme LLC'))->toBe('acme');
    expect($this->normalizer->normalizeCompany('Tech Pty Ltd'))->toBe('tech');
    expect($this->normalizer->normalizeCompany('Canva GmbH'))->toBe('canva');
});

it('normalizes company names by stripping region and corporation suffixes', function () {
    expect($this->normalizer->normalizeCompany('Acme Corporation'))->toBe('acme');
    expect($this->normalizer->normalizeCompany('Philippines Tech Co.'))->toBe('tech');
    expect($this->normalizer->normalizeCompany('Manila Digital Corp.'))->toBe('manila digital');
});

it('normalizes company names case and extra characters', function () {
    expect($this->normalizer->normalizeCompany('  CANVA, Inc.  '))->toBe('canva');
    expect($this->normalizer->normalizeCompany('Google-Cloud Inc.'))->toBe('googlecloud');
});

it('normalizes job titles by expanding common abbreviations', function () {
    expect($this->normalizer->normalizeJobTitle('Sr. React Dev'))->toBe('senior react developer');
    expect($this->normalizer->normalizeJobTitle('Jr. PHP Dev'))->toBe('junior php developer');
    expect($this->normalizer->normalizeJobTitle('Lead Software Eng'))->toBe('lead software engineer');
    expect($this->normalizer->normalizeJobTitle('Full Stack Dev Manager'))->toBe('full stack developer manager');
});

it('normalizes job titles with expanded abbreviations', function () {
    expect($this->normalizer->normalizeJobTitle('Software Eng'))->toBe('software engineer');
    expect($this->normalizer->normalizeJobTitle('Tech Lead Manager'))->toBe('technical lead manager');
    expect($this->normalizer->normalizeJobTitle('UI/UX Designer'))->toBe('user interface user experience designer');
    expect($this->normalizer->normalizeJobTitle('ML Engineer'))->toBe('machine learning engineer');
});

it('normalizes job titles to lowercase with no special chars', function () {
    expect($this->normalizer->normalizeJobTitle('  Sr. React Dev  '))->toBe('senior react developer');
});

it('creates a description fingerprint by stripping HTML and punctuation', function () {
    $html = '<p>Looking for a <strong>Senior PHP Developer</strong> with 5+ years experience.</p>';
    $fingerprint = $this->normalizer->createDescriptionFingerprint($html);

    expect($fingerprint)->not->toContain('<');
    expect($fingerprint)->not->toContain('>');
    expect($fingerprint)->toContain('senior php developer');
    expect($fingerprint)->toContain('looking for a');
});

it('truncates description fingerprint to 500 characters', function () {
    $long = str_repeat('A sentence with words. ', 200);
    $fingerprint = $this->normalizer->createDescriptionFingerprint($long);

    expect(strlen($fingerprint))->toBeLessThanOrEqual(500);
});

it('generates consistent canonical keys for equivalent inputs', function () {
    $key1 = $this->normalizer->generateCanonicalKey(
        'job_match',
        'Canva Philippines Inc.',
        'Sr. React Dev',
        '<p>Looking for a Senior React Developer</p>',
    );

    $key2 = $this->normalizer->generateCanonicalKey(
        'job_match',
        'Canva',
        'Senior React Developer',
        'Looking for a Senior React Developer',
    );

    expect($key1)->toBe($key2);
});

it('generates different canonical keys for different feature types', function () {
    $key1 = $this->normalizer->generateCanonicalKey(
        'job_match',
        'Canva',
        'Developer',
        'Build web apps',
    );

    $key2 = $this->normalizer->generateCanonicalKey(
        'salary_check',
        'Canva',
        'Developer',
        'Build web apps',
    );

    expect($key1)->not->toBe($key2);
});

it('generates different canonical keys for different inputs', function () {
    $key1 = $this->normalizer->generateCanonicalKey(
        'job_match',
        'Google',
        'Engineer',
        'Build web apps',
    );

    $key2 = $this->normalizer->generateCanonicalKey(
        'job_match',
        'Facebook',
        'Engineer',
        'Build web apps',
    );

    expect($key1)->not->toBe($key2);
});

it('normalizes resume text by adding markdown section headers when missing', function () {
    $raw = "5 years of PHP development experience.\nStrong Laravel and React skills.\nBSc Computer Science.";
    $result = $this->normalizer->normalizeResumeText($raw);

    expect($result)->toContain('## SUMMARY');
    expect($result)->toContain('## WORK EXPERIENCE');
    expect($result)->toContain('## SKILLS & TECHNOLOGIES');
    expect($result)->toContain('## EDUCATION & CERTIFICATIONS');
});

it('preserves existing markdown section headers during normalization', function () {
    $raw = "## SUMMARY\nExperienced developer.\n## WORK EXPERIENCE\nSenior dev at Acme.";
    $result = $this->normalizer->normalizeResumeText($raw);

    expect($result)->toContain('## SUMMARY');
    expect($result)->toContain('## WORK EXPERIENCE');
    expect($result)->toContain('## SKILLS & TECHNOLOGIES');
    expect($result)->toContain('## EDUCATION & CERTIFICATIONS');
    expect(substr_count($result, '## SUMMARY'))->toBe(1);
});

it('normalizes common section header variations to standard format', function () {
    $raw = "Summary:\nExperienced.\n\nSkills:\nPHP, Laravel, React\n\nEducation:\nBSc CS";
    $result = $this->normalizer->normalizeResumeText($raw);

    expect($result)->toContain('## SUMMARY');
    expect($result)->toContain('## SKILLS & TECHNOLOGIES');
    expect($result)->toContain('## EDUCATION & CERTIFICATIONS');
});

it('normalizes different company suffix variants to same canonical key', function () {
    $key1 = $this->normalizer->generateCanonicalKey(
        'job_match',
        'Google Inc.',
        'Developer',
        'Build software',
    );

    $key2 = $this->normalizer->generateCanonicalKey(
        'job_match',
        'Google Corp',
        'Developer',
        'Build software',
    );

    expect($key1)->toBe($key2);
});
