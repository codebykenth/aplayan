<?php

namespace App\Models;

use Database\Factories\ApplicationTemplateFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $user_id
 * @property string $name
 * @property string|null $category
 * @property string|null $default_location
 * @property int|null $default_expected_salary
 * @property string|null $default_job_description_keywords
 * @property string|null $default_notes
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class ApplicationTemplate extends Model
{
    /** @use HasFactory<ApplicationTemplateFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'category',
        'default_location',
        'default_expected_salary',
        'default_job_description_keywords',
        'default_notes',
    ];

    protected function casts(): array
    {
        return [
            'default_expected_salary' => 'integer',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
