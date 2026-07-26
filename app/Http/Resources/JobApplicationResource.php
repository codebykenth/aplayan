<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class JobApplicationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'company_name' => $this->company_name,
            'job_title' => $this->job_title,
            'job_url' => $this->job_url,
            'job_description' => $this->job_description,
            'location' => $this->location,
            'status' => $this->status,
            'date_applied' => $this->date_applied?->toDateString(),
            'expected_salary' => $this->expected_salary,
            'offered_salary' => $this->offered_salary,
            'notes' => $this->notes,
            'ai_match_percentage' => $this->ai_match_percentage,
            'ai_strengths' => $this->ai_strengths,
            'ai_gaps' => $this->ai_gaps,
            'ai_salary_min' => $this->ai_salary_min,
            'ai_salary_max' => $this->ai_salary_max,
            'ai_salary_notes' => $this->ai_salary_notes,
            'ai_evaluated_at' => $this->ai_evaluated_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'activities' => $this->activities->map(fn ($activity) => [
                'id' => $activity->id,
                'type' => $activity->type,
                'description' => $activity->description,
                'created_at' => $activity->created_at?->toIso8601String(),
            ])->sortByDesc('created_at')->values(),
        ];
    }
}
