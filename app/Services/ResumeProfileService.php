<?php

namespace App\Services;

use App\Models\ResumeProfile;
use App\Models\User;

class ResumeProfileService
{
    public function getOrCreateProfile(User $user): ?ResumeProfile
    {
        return $user->resumeProfile;
    }

    public function updateProfile(User $user, array $data): ResumeProfile
    {
        return $user->resumeProfile()->updateOrCreate(
            ['user_id' => $user->id],
            $data,
        );
    }

    public function buildProfileText(ResumeProfile $profile): string
    {
        $parts = [
            "Name: {$profile->full_name}",
            "Email: {$profile->email}",
            "Phone: {$profile->phone}",
            "Location: {$profile->location}",
        ];

        if ($profile->linkedin_url) {
            $parts[] = "LinkedIn: {$profile->linkedin_url}";
        }

        if ($profile->github_url) {
            $parts[] = "GitHub: {$profile->github_url}";
        }

        if ($profile->website_url) {
            $parts[] = "Website: {$profile->website_url}";
        }

        if ($profile->summary) {
            $parts[] = "\nSummary:\n{$profile->summary}";
        }

        if ($profile->work_experience !== []) {
            $parts[] = "\nWork Experience:";
            foreach ($profile->work_experience as $job) {
                $parts[] = "- {$job['position']} at {$job['company']} ({$job['duration']})";
                if (isset($job['description'])) {
                    $parts[] = "  {$job['description']}";
                }
            }
        }

        if ($profile->education !== []) {
            $parts[] = "\nEducation:";
            foreach ($profile->education as $edu) {
                $parts[] = "- {$edu['degree']}, {$edu['institution']} ({$edu['year']})";
            }
        }

        if ($profile->skills !== []) {
            $parts[] = "\nSkills: ".implode(', ', $profile->skills);
        }

        if ($profile->certifications !== []) {
            $parts[] = "\nCertifications: ".implode(', ', $profile->certifications);
        }

        if ($profile->projects !== []) {
            $parts[] = "\nProjects:";
            foreach ($profile->projects as $project) {
                $line = "- {$project['title']}";
                if (isset($project['technologies'])) {
                    $line .= " ({$project['technologies']})";
                }
                $parts[] = $line;
                if (isset($project['description'])) {
                    $parts[] = "  {$project['description']}";
                }
            }
        }

        return implode("\n", $parts);
    }
}
