<?php

namespace App\Models;

use Carbon\Carbon;
use Database\Factories\ResumeProfileFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $user_id
 * @property string $full_name
 * @property string $email
 * @property string $phone
 * @property string $location
 * @property string|null $photo_url
 * @property string|null $linkedin_url
 * @property string|null $github_url
 * @property string|null $website_url
 * @property string|null $summary
 * @property array $work_experience
 * @property array $education
 * @property array $skills
 * @property array $certifications
 * @property array $projects
 * @property Carbon $created_at
 * @property Carbon $updated_at
 */
class ResumeProfile extends Model
{
    /** @use HasFactory<ResumeProfileFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'target_role',
        'full_name',
        'email',
        'phone',
        'location',
        'photo_url',
        'linkedin_url',
        'github_url',
        'website_url',
        'summary',
        'work_experience',
        'education',
        'skills',
        'certifications',
        'projects',
    ];

    protected function casts(): array
    {
        return [
            'work_experience' => 'array',
            'education' => 'array',
            'skills' => 'array',
            'certifications' => 'array',
            'projects' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
