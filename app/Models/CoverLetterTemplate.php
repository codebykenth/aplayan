<?php

namespace App\Models;

use Database\Factories\CoverLetterTemplateFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $user_id
 * @property string $title
 * @property string|null $recipient
 * @property string $content
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class CoverLetterTemplate extends Model
{
    /** @use HasFactory<CoverLetterTemplateFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'recipient',
        'content',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
