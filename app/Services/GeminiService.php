<?php

namespace App\Services;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use JsonException;

class GeminiService
{
    private const string MODEL = 'gemini-1.5-flash';

    private const int TIMEOUT = 30;

    private const int CONNECT_TIMEOUT = 5;

    public function analyzeResumeMatch(string $jobDescription, string $resumeText): array
    {
        $prompt = <<<PROMPT
You are an elite ATS and technical recruiter evaluation agent. Perform a rigorous, step-by-step evaluation comparing the provided Job Description and Candidate Resume.

Follow this Chain-of-Thought reasoning process:
1. Extract all required skills, technologies, and qualifications from the Job Description.
2. Compare each requirement against the Candidate Resume section by section.
3. For each of the 4 rubric pillars below, calculate an individual score before computing the weighted total.
4. For ecosystem-adjacent technologies (e.g. React -> Next.js, MySQL -> PostgreSQL, Docker -> Kubernetes), award 75% partial credit.

EVALUATION RUBRIC & WEIGHTING:
1. Technical Skills & Tech Stack Match (40% weight): Compare exact tools, frameworks, and languages. Award 100% for direct matches, 75% for ecosystem-adjacent technologies.
2. Work Experience & Relevance (35% weight): Compare years of experience, industry alignment, and direct job responsibilities.
3. Seniority & Scope of Responsibility (15% weight): Compare title hierarchy (Junior, Mid, Senior, Lead) and team/project scale.
4. Education, Certifications & Soft Skills (10% weight): Compare degree relevance, professional certifications, and communication/leadership evidence.

Calculate the final `match_percentage` as the weighted sum of these 4 pillars.

Return ONLY a raw valid JSON object (no markdown code fences or backticks) with these exact keys:
- match_percentage (integer 0-100, weighted overall score)
- tech_stack_percentage (integer 0-100)
- experience_percentage (integer 0-100)
- education_percentage (integer 0-100)
- strengths (array of concise, specific matching bullet points)
- gaps (array of concise, missing skill or experience bullet points)

Job Description:
{$jobDescription}

Candidate Resume:
{$resumeText}
PROMPT;

        $response = $this->sendRequest($prompt);

        return $this->extractJson($response, [
            'match_percentage',
            'tech_stack_percentage',
            'experience_percentage',
            'education_percentage',
            'strengths',
            'gaps',
        ]);
    }

    public function estimateSalary(string $jobTitle, string $location, ?string $jobDescription): array
    {
        $desc = $jobDescription
            ? "Job Description:\n{$jobDescription}"
            : 'No job description provided.';

        $prompt = <<<PROMPT
You are a salary estimation expert. Based on the following job details, estimate the salary range.
Return ONLY a raw valid JSON object (no markdown code fences or backticks) with these exact keys:
- min_salary_php (integer, monthly PHP salary)
- max_salary_php (integer, monthly PHP salary)
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

Return ONLY a raw valid JSON object (no markdown code fences or backticks) with these exact keys:
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
        $model = config('services.gemini.model', 'gemini-1.5-flash');
        $apiKey = config('services.gemini.key');

        if (blank($apiKey)) {
            Log::error('Gemini API Error: GEMINI_API_KEY is not set in environment or config.');
            throw new \InvalidArgumentException('GEMINI_API_KEY is missing from environment.');
        }

        try {
            return $this->client()
                ->retry([100, 500])
                ->post('/'.$model.':generateContent', [
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
        } catch (RequestException $e) {
            $responseBody = $e->response ? $e->response->body() : 'No response body';
            Log::error("Gemini API Request Failed [Model: {$model}]: ".$e->getMessage(), [
                'status' => $e->response?->status(),
                'response_body' => $responseBody,
                'model' => $model,
            ]);

            throw $e;
        } catch (\Throwable $e) {
            Log::error("Gemini API Exception [Model: {$model}]: ".$e->getMessage(), [
                'exception' => $e,
                'model' => $model,
            ]);

            throw $e;
        }
    }

    private function extractJson(array $response, array $expectedKeys): array
    {
        $text = $response['candidates'][0]['content']['parts'][0]['text'] ?? throw new JsonException('Unexpected API response structure');

        $cleanText = preg_replace('/^```(?:json)?\s*|\s*```$/i', '', trim($text));
        if (preg_match('/\{[\s\S]*\}/', $cleanText, $matches)) {
            $cleanText = $matches[0];
        }

        $parsed = json_decode($cleanText, true, flags: JSON_THROW_ON_ERROR);

        $missing = array_diff($expectedKeys, array_keys($parsed));
        if ($missing !== []) {
            throw new JsonException('Missing keys in API response: '.implode(', ', $missing));
        }

        return Arr::only($parsed, $expectedKeys);
    }
}
