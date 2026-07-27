<?php

namespace App\Models;

use Database\Factories\AiResponseCacheFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $canonical_key
 * @property string $feature_type
 * @property string|null $normalized_company
 * @property string|null $normalized_title
 * @property array $response_data
 * @property int $hit_count
 * @property Carbon|null $expires_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class AiResponseCache extends Model
{
    /** @use HasFactory<AiResponseCacheFactory> */
    use HasFactory;

    protected $table = 'ai_responses_cache';

    protected $fillable = [
        'canonical_key',
        'feature_type',
        'normalized_company',
        'normalized_title',
        'response_data',
        'hit_count',
        'expires_at',
    ];

    protected function casts(): array
    {
        return [
            'response_data' => 'array',
            'hit_count' => 'integer',
            'expires_at' => 'datetime',
        ];
    }

    public function scopeByCanonicalKey($query, string $key)
    {
        return $query->where('canonical_key', $key);
    }
}
