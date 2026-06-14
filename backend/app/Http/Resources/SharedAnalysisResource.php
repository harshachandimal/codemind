<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SharedAnalysisResource extends JsonResource
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
            'status' => $this->status,
            'time_complexity' => $this->time_complexity,
            'space_complexity' => $this->space_complexity,
            'detected_patterns' => $this->detected_patterns,
            'explanation' => $this->explanation,
            'trace_mode' => $this->trace_mode,
            'trace_steps' => $this->trace_steps,
            'trace_summary' => $this->trace_summary,
            'trace_result' => $this->trace_result,
            'trace_plan' => $this->trace_plan,
            'trace_error' => $this->trace_error,
            'trace_metadata' => $this->trace_metadata,
            'created_at' => $this->created_at,
        ];
    }
}
