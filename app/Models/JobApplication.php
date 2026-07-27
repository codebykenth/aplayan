<?php

namespace App\Models;

use Carbon\Carbon;
use Database\Factories\JobApplicationFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int $user_id
 * @property string $company_name
 * @property string $job_title
 * @property string|null $job_url
 * @property string|null $job_description
 * @property string $location
 * @property string $status
 * @property string|null $date_applied
 * @property int|null $expected_salary
 * @property int|null $offered_salary
 * @property string|null $notes
 * @property int|null $ai_match_percentage
 * @property array|null $ai_strengths
 * @property array|null $ai_gaps
 * @property int|null $ai_salary_min
 * @property int|null $ai_salary_max
 * @property string|null $ai_salary_notes
 * @property Carbon|null $ai_evaluated_at
 * @property Carbon|null $last_contacted_at
 * @property Carbon|null $interview_date
 * @property string|null $interview_notes
 * @property array|null $ai_interview_prep
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class JobApplication extends Model
{
    /** @use HasFactory<JobApplicationFactory> */
    use HasFactory;

    protected $fillable = [
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
        'last_contacted_at',
        'interview_date',
        'interview_notes',
        'ai_interview_prep',
        'ai_match_percentage',
        'ai_strengths',
        'ai_gaps',
        'ai_salary_min',
        'ai_salary_max',
        'ai_salary_notes',
        'ai_evaluated_at',
    ];

    protected function casts(): array
    {
        return [
            'date_applied' => 'date:Y-m-d',
            'expected_salary' => 'integer',
            'offered_salary' => 'integer',
            'ai_match_percentage' => 'integer',
            'ai_strengths' => 'array',
            'ai_gaps' => 'array',
            'ai_salary_min' => 'integer',
            'ai_salary_max' => 'integer',
            'ai_evaluated_at' => 'datetime',
            'last_contacted_at' => 'datetime',
            'interview_date' => 'datetime',
            'ai_interview_prep' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function activities(): HasMany
    {
        return $this->hasMany(JobApplicationActivity::class);
    }

    public function contacts(): BelongsToMany
    {
        return $this->belongsToMany(Contact::class)->withTimestamps();
    }
}
