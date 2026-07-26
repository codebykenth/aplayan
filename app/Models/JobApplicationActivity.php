<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $job_application_id
 * @property string $type
 * @property string $description
 * @property Carbon|null $created_at
 */
class JobApplicationActivity extends Model
{
    protected $fillable = [
        'job_application_id',
        'type',
        'description',
    ];

    public function jobApplication(): BelongsTo
    {
        return $this->belongsTo(JobApplication::class);
    }
}
