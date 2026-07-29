<?php

namespace App\Services;

class AiFallbackService
{
    public function computeJobMatchScore(string $jobDescription, string $resumeText): array
    {
        $jobWords = $this->extractSignificantWords($jobDescription);
        $resumeWords = $this->extractSignificantWords($resumeText);

        $common = array_intersect($jobWords, $resumeWords);
        $total = count($jobWords);
        $matched = count($common);

        $percentage = $total > 0 ? (int) round(($matched / max($total, 1)) * 100) : 0;
        $percentage = min(max($percentage, 0), 100);

        $topMatches = array_slice($common, 0, 5);

        $strengths = array_map(fn (string $word): string => "Matching keyword: '{$word}'", $topMatches);

        $missing = array_diff($jobWords, $resumeWords);
        $topMissing = array_slice($missing, 0, 5);
        $gaps = array_map(fn (string $word): string => "Missing keyword: '{$word}'", $topMissing);

        return [
            'match_percentage' => $percentage,
            'tech_stack_percentage' => $percentage,
            'experience_percentage' => $percentage,
            'education_percentage' => $percentage,
            'strengths' => $strengths ?: ['Resume submitted for review'],
            'gaps' => $gaps ?: ['Unable to determine all requirements'],
            '_fallback' => true,
            '_badge' => 'Generated via Smart Analysis (AI provider busy)',
        ];
    }

    public function polishText(string $content): string
    {
        $polished = preg_replace('/\s+/', ' ', $content);
        $polished = trim($polished);

        $polished = preg_replace('/([.!?])\s*/', "$1\n", $polished);
        $polished = trim($polished);

        return $polished."\n\n---\n*Polished via Smart Analysis (AI provider busy)*";
    }

    public function isAvailable(): bool
    {
        return false;
    }

    private function extractSignificantWords(string $text): array
    {
        $cleaned = strip_tags($text);
        $cleaned = preg_replace('/[^\w\s]/', ' ', $cleaned);
        $cleaned = mb_strtolower($cleaned);

        $words = preg_split('/\s+/', $cleaned, -1, PREG_SPLIT_NO_EMPTY);

        $stopWords = [
            'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
            'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be',
            'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
            'would', 'could', 'should', 'may', 'might', 'shall', 'can', 'not',
            'no', 'nor', 'this', 'that', 'these', 'those', 'it', 'its', 'you',
            'your', 'we', 'our', 'they', 'their', 'he', 'she', 'him', 'her',
            'his', 'all', 'each', 'every', 'both', 'few', 'more', 'most',
            'some', 'any', 'such', 'only', 'own', 'same', 'so', 'than', 'too',
            'very', 'just', 'about', 'above', 'after', 'again', 'against',
            'below', 'between', 'during', 'before', 'into', 'through', 'up',
            'down', 'out', 'off', 'over', 'under', 'then', 'once', 'here',
            'there', 'when', 'where', 'why', 'how', 'which', 'who', 'whom',
            'what', 'if', 'while', 'because', 'until', 'although', 'though',
            'job', 'title', 'department', 'employment', 'type', 'location',
            'role', 'overview', 'responsibilities', 'qualifications', 'skills',
            'experience', 'level', 'nice', 'have', 'required', 'preferred',
            'key', 'plus', 'requirements', 'summary', 'details',
        ];

        return array_values(array_filter($words, fn (string $word) => ! in_array($word, $stopWords, true) && strlen($word) > 2));
    }
}
