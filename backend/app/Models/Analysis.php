<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Enums\AnalysisStatus;

class Analysis extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'language',
        'source_code',
        'status',
        'time_complexity',
        'space_complexity',
        'detected_patterns',
        'explanation',
    ];

    protected function casts(): array
    {
        return [
            'status' => AnalysisStatus::class,
            'detected_patterns' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
