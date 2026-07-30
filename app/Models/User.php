<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $name
 * @property string $email
 * @property Carbon|null $email_verified_at
 * @property string $password
 * @property string|null $google_id
 * @property string|null $avatar
 * @property int|null $expected_salary
 * @property string $base_currency
 * @property array|null $job_search_preferences
 * @property string $theme
 * @property string $color_theme
 * @property int $weekly_goal
 * @property int $goal_streak
 * @property string|null $remember_token
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['name', 'email', 'password', 'google_id', 'avatar', 'expected_salary', 'base_currency', 'job_search_preferences', 'theme', 'color_theme', 'weekly_goal', 'goal_streak', 'tax_settings', 'role'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function jobApplications(): HasMany
    {
        return $this->hasMany(JobApplication::class);
    }

    public function applicationTemplates(): HasMany
    {
        return $this->hasMany(ApplicationTemplate::class);
    }

    public function resumeProfile(): HasOne
    {
        return $this->hasOne(ResumeProfile::class);
    }

    public function savedResumes(): HasMany
    {
        return $this->hasMany(SavedResume::class);
    }

    public function savedCoverLetters(): HasMany
    {
        return $this->hasMany(SavedCoverLetter::class);
    }

    public function contacts(): HasMany
    {
        return $this->hasMany(Contact::class);
    }

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'expected_salary' => 'integer',
            'job_search_preferences' => 'array',
            'tax_settings' => 'array',
            'role' => 'string',
        ];
    }
}
