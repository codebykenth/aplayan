<?php

namespace App\Http\Resources;

use App\Services\JobApplicationService;
use App\Services\PhilippineTaxCalculatorService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class JobApplicationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $service = app(JobApplicationService::class);

        $salary = $this->offered_salary ?? $this->expected_salary;

        $taxBreakdown = null;
        if ($salary !== null) {
            $taxCalculator = app(PhilippineTaxCalculatorService::class);
            $userDefaults = $this->user?->tax_settings;
            $taxBreakdown = $taxCalculator->computeMonthlyNetPay(
                (float) $salary,
                $this->tax_config,
                $userDefaults,
            );
        }

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
            'tax_config' => $this->tax_config,
            'tax_breakdown' => $taxBreakdown,
            'notes' => $this->notes,
            'last_contacted_at' => $this->last_contacted_at?->toIso8601String(),
            'interview_date' => $this->interview_date?->toIso8601String(),
            'interview_notes' => $this->interview_notes,
            'staleness_level' => $service->stalenessLevel($this->resource),
            'days_since_update' => $service->daysSinceLastUpdate($this->resource),
            'ai_match_percentage' => $this->ai_match_percentage,
            'ai_strengths' => $this->ai_strengths,
            'ai_gaps' => $this->ai_gaps,
            'ai_salary_min' => $this->ai_salary_min,
            'ai_salary_max' => $this->ai_salary_max,
            'ai_salary_notes' => $this->ai_salary_notes,
            'ai_evaluated_at' => $this->ai_evaluated_at?->toIso8601String(),
            'ai_interview_prep' => $this->ai_interview_prep,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
            'activities' => $this->activities->map(fn ($activity) => [
                'id' => $activity->id,
                'type' => $activity->type,
                'description' => $activity->description,
                'created_at' => $activity->created_at?->toIso8601String(),
            ])->sortByDesc('created_at')->values(),
            'contacts' => $this->relationLoaded('contacts')
                ? $this->contacts->map(fn ($contact) => [
                    'id' => $contact->id,
                    'name' => $contact->name,
                    'email' => $contact->email,
                    'phone' => $contact->phone,
                    'company_name' => $contact->company_name,
                    'role' => $contact->role,
                ])
                : [],
        ];
    }
}
