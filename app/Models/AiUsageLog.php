<?php

namespace App\Models;

use Database\Factories\AiUsageLogFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int|null $user_id
 * @property string $feature_type
 * @property int $prompt_tokens
 * @property int $completion_tokens
 * @property int $total_tokens
 * @property bool $is_cache_hit
 * @property float $estimated_cost
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class AiUsageLog extends Model
{
    /** @use HasFactory<AiUsageLogFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'feature_type',
        'model',
        'prompt_tokens',
        'completion_tokens',
        'total_tokens',
        'is_cache_hit',
        'estimated_cost',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    protected function casts(): array
    {
        return [
            'is_cache_hit' => 'boolean',
            'estimated_cost' => 'decimal:6',
        ];
    }
}
