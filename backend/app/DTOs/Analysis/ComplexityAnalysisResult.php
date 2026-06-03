<?php

namespace App\DTOs\Analysis;

class ComplexityAnalysisResult
{
    public function __construct(
        public readonly string $timeComplexity,
        public readonly string $spaceComplexity,
        public readonly array $detectedPatterns,
        public readonly string $explanation,
    ) {
    }

    public function toArray(): array
    {
        return [
            'time_complexity' => $this->timeComplexity,
            'space_complexity' => $this->spaceComplexity,
            'detected_patterns' => $this->detectedPatterns,
            'explanation' => $this->explanation,
        ];
    }
}
