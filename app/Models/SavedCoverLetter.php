<?php

namespace App\Models;

use Database\Factories\SavedCoverLetterFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SavedCoverLetter extends Model
{
    /** @use HasFactory<SavedCoverLetterFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'job_description',
        'target_company',
        'target_job_title',
        'content',
        'template',
        'recipient',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
