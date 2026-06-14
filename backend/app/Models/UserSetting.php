<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserSetting extends Model
{
    protected $fillable = [
        'user_id',
        'default_language',
        'editor_font_size',
        'show_visual_explanations',
        'show_runtime_trace',
        'dashboard_density',
    ];

    protected function casts(): array
    {
        return [
            'editor_font_size' => 'integer',
            'show_visual_explanations' => 'boolean',
            'show_runtime_trace' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
