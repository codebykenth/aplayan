<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LegalDocument extends Model
{
    protected $fillable = [
        'key',
        'title',
        'content',
        'version',
    ];

    protected function casts(): array
    {
        return [
            'version' => 'integer',
        ];
    }
}
