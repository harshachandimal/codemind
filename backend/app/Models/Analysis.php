<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
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
        'trace_mode',
        'trace_steps',
        'trace_summary',
        'trace_result',
        'trace_plan',
        'trace_error',
        'trace_metadata',
        'entry_function',
        'runtime_input',
    ];

    protected function casts(): array
    {
        return [
            'status' => AnalysisStatus::class,
            'detected_patterns' => 'array',
            'trace_steps' => 'array',
            'trace_summary' => 'array',
            'trace_result' => 'array',
            'trace_plan'           => 'array',
            'trace_error'          => 'array',
            'trace_metadata'       => 'array',
            'runtime_input'        => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function shares(): HasMany
    {
        return $this->hasMany(AnalysisShare::class);
    }
}
