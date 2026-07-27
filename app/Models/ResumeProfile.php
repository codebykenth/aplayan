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
 * @property string|null $summary
 * @property array $work_experience
 * @property array $education
 * @property array $skills
 * @property array $certifications
 * @property Carbon $created_at
 * @property Carbon $updated_at
 */
class ResumeProfile extends Model
{
    /** @use HasFactory<ResumeProfileFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'full_name',
        'email',
        'phone',
        'location',
        'photo_url',
        'linkedin_url',
        'summary',
        'work_experience',
        'education',
        'skills',
        'certifications',
    ];

    protected function casts(): array
    {
        return [
            'work_experience' => 'array',
            'education' => 'array',
            'skills' => 'array',
            'certifications' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
