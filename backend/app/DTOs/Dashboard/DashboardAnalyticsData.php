<?php

namespace App\DTOs\Dashboard;

class DashboardAnalyticsData
{
    public function __construct(
        public readonly array $summary,
        public readonly array $languageBreakdown,
        public readonly array $timeComplexityBreakdown,
        public readonly array $spaceComplexityBreakdown,
        public readonly array $detectedPatternBreakdown,
        public readonly array $traceModeBreakdown,
        public readonly array $recentActivity,
        public readonly array $latestAnalyses,
    ) {
    }

    public function toArray(): array
    {
        return [
            'summary'                    => $this->summary,
            'language_breakdown'         => $this->languageBreakdown,
            'time_complexity_breakdown'  => $this->timeComplexityBreakdown,
            'space_complexity_breakdown' => $this->spaceComplexityBreakdown,
            'detected_pattern_breakdown' => $this->detectedPatternBreakdown,
            'trace_mode_breakdown'       => $this->traceModeBreakdown,
            'recent_activity'            => $this->recentActivity,
            'latest_analyses'            => $this->latestAnalyses,
        ];
    }
}
