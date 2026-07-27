<?php

namespace App\Models;

use Database\Factories\SavedResumeFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SavedResume extends Model
{
    /** @use HasFactory<SavedResumeFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'name',
        'template',
        'profile_data',
        'photo_url',
    ];

    protected function casts(): array
    {
        return [
            'profile_data' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
