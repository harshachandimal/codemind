<?php

namespace App\Http\Resources\Analysis;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AnalysisResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'language' => $this->language,
            'source_code' => $this->source_code,
            'status' => $this->status instanceof \App\Enums\AnalysisStatus
                ? $this->status->value
                : $this->status,
            'time_complexity' => $this->time_complexity,
            'space_complexity' => $this->space_complexity,
            'detected_patterns' => $this->detected_patterns,
            'explanation' => $this->explanation,
            'created_at' => $this->created_at ? $this->created_at->toIso8601String() : null,
            'updated_at' => $this->updated_at ? $this->updated_at->toIso8601String() : null,
        ];
    }
}
