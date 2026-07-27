<?php

namespace App\Services;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Http;
use JsonException;

class GeminiService
{
    private const string MODEL = 'gemini-2.5-flash';

    private const int TIMEOUT = 30;

    private const int CONNECT_TIMEOUT = 5;

    public function analyzeResumeMatch(string $jobDescription, string $resumeText): array
    {
        $prompt = <<<PROMPT
You are an expert resume analyst. Analyze the following job description and resume text.
Return a JSON object with these exact keys:
- match_percentage (integer 0-100)
- strengths (array of strings)
- gaps (array of strings)

Job Description:
{$jobDescription}

Resume:
{$resumeText}
PROMPT;

        $response = $this->sendRequest($prompt);

        return $this->extractJson($response, ['match_percentage', 'strengths', 'gaps']);
    }

    public function estimateSalary(string $jobTitle, string $location, ?string $jobDescription): array
    {
        $desc = $jobDescription
            ? "Job Description:\n{$jobDescription}"
            : 'No job description provided.';

        $prompt = <<<PROMPT
You are a salary estimation expert. Based on the following job details, estimate the salary range.
Return a JSON object with these exact keys:
- min_salary_php (integer, annual PHP salary)
- max_salary_php (integer, annual PHP salary)
- market_context (string, brief explanation of the market context)

Job Title: {$jobTitle}
Location: {$location}
{$desc}
PROMPT;

        $response = $this->sendRequest($prompt);

        return $this->extractJson($response, ['min_salary_php', 'max_salary_php', 'market_context']);
    }

    public function generateFollowUpEmail(string $companyName, string $jobTitle, int $daysSinceContact, string $status): string
    {
        $prompt = <<<PROMPT
You are a professional career coach helping a job seeker in the Philippines write a follow-up email after a job application.

The applicant applied for a "{$jobTitle}" position at "{$companyName}" and it has been {$daysSinceContact} days since they last contacted the employer. The application status is "{$status}".

Write a professional, concise follow-up email draft that:
- Is polite and respectful of the employer's time
- References the specific role and company
- Mentions the elapsed time appropriately
- Expresses continued interest and enthusiasm
- Asks for an update on the application status
- Is appropriate for the Philippine professional context

Return ONLY the email draft text, no subject line or additional commentary. Keep it under 200 words.
PROMPT;

        $response = $this->sendRequest($prompt);

        return $response['candidates'][0]['content']['parts'][0]['text'] ?? 'Unable to generate follow-up email.';
    }

    public function generateInterviewPrep(string $jobDescription): array
    {
        $prompt = <<<PROMPT
You are an expert interview coach. Based on the following job description, generate interview preparation content.

Return a JSON object with these exact keys:
- questions (array of strings): common interview questions for this role
- talking_points (array of strings): key points to highlight during the interview
- tips (array of strings): tips for acing this specific type of interview

Job Description:
{$jobDescription}
PROMPT;

        $response = $this->sendRequest($prompt);

        return $this->extractJson($response, ['questions', 'talking_points', 'tips']);
    }

    public function generateCoverLetter(string $profileText, string $jobDescription): string
    {
        $prompt = <<<PROMPT
You are a professional career coach helping a job seeker in the Philippines write a tailored cover letter.

Use the following resume profile to personalize the letter:

{$profileText}

Job Description:
{$jobDescription}

Write a professional, compelling cover letter that:
- Is tailored to the specific job and company
- Highlights relevant experience and skills from the profile
- Shows enthusiasm for the role
- Is appropriate for the Philippine professional context
- Is concise (under 300 words)
- Uses a formal but personable tone

Return ONLY the cover letter text, no subject line or additional commentary.
PROMPT;

        $response = $this->sendRequest($prompt);

        return $response['candidates'][0]['content']['parts'][0]['text'] ?? 'Unable to generate cover letter.';
    }

    public function polishResumeSection(string $sectionType, string $content, string $context = ''): string
    {
        $sectionLabels = [
            'summary' => 'professional summary',
            'work_experience' => 'work experience description',
            'projects' => 'project description',
        ];

        $label = $sectionLabels[$sectionType] ?? $sectionType;

        $prompt = <<<PROMPT
You are a professional resume writer helping a job seeker in the Philippines polish their resume.

Polish the following {$label} to make it more impactful, professional, and ATS-friendly.
- Use strong action verbs and quantifiable achievements
- Keep the same factual content and key details
- Return ONLY the polished text, no commentary or labels

{$context}

Content to polish:
{$content}
PROMPT;

        $response = $this->sendRequest($prompt);

        return $response['candidates'][0]['content']['parts'][0]['text'] ?? 'Unable to polish section.';
    }

    public function improveCoverLetter(string $content, string $preset): string
    {
        $presetInstructions = [
            'polish' => 'Polish the grammar, spelling, and flow while preserving the original meaning and structure.',
            'concise' => 'Make the cover letter more concise and to-the-point. Reduce wordiness while keeping all key information.',
            'formal' => 'Make the cover letter more formal and professional in tone. Use formal business language.',
        ];

        $instruction = $presetInstructions[$preset] ?? 'Polish the grammar and flow of this cover letter.';

        $prompt = <<<PROMPT
You are a professional career coach helping a job seeker in the Philippines improve their cover letter.

{$instruction}

Return ONLY the improved cover letter text, no commentary or labels.

Cover Letter:
{$content}
PROMPT;

        $response = $this->sendRequest($prompt);

        return $response['candidates'][0]['content']['parts'][0]['text'] ?? 'Unable to improve cover letter.';
    }

    private function client(): PendingRequest
    {
        return Http::timeout(self::TIMEOUT)
            ->connectTimeout(self::CONNECT_TIMEOUT)
            ->baseUrl('https://generativelanguage.googleapis.com/v1beta/models')
            ->withQueryParameters(['key' => config('services.gemini.key')])
            ->asJson();
    }

    private function sendRequest(string $prompt): array
    {
        return $this->client()
            ->retry([100, 500])
            ->post('/'.self::MODEL.':generateContent', [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $prompt],
                        ],
                    ],
                ],
            ])
            ->throw()
            ->json();
    }

    private function extractJson(array $response, array $expectedKeys): array
    {
        $text = $response['candidates'][0]['content']['parts'][0]['text'] ?? throw new JsonException('Unexpected API response structure');

        $parsed = json_decode($text, true, flags: JSON_THROW_ON_ERROR);

        $missing = array_diff($expectedKeys, array_keys($parsed));
        if ($missing !== []) {
            throw new JsonException('Missing keys in API response: '.implode(', ', $missing));
        }

        return Arr::only($parsed, $expectedKeys);
    }
}
