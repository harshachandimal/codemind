<?php

namespace App\Services\Dashboard;

use App\DTOs\Dashboard\DashboardAnalyticsData;
use App\Enums\AnalysisStatus;
use App\Models\User;
use Illuminate\Support\Collection;

class DashboardAnalyticsService
{
    /**
     * Build dashboard analytics scoped strictly to the given user.
     * Never exposes source_code, explanation, trace_steps, or user_id.
     */
    public function getForUser(User $user): DashboardAnalyticsData
    {
        $baseQuery = fn () => $user->analyses();

        // ── Summary counts ────────────────────────────────────────────────
        $total     = $baseQuery()->count();
        $completed = $baseQuery()->where('status', AnalysisStatus::Completed->value)->count();
        $failed    = $baseQuery()->where('status', AnalysisStatus::Failed->value)->count();
        $pending   = $baseQuery()->where('status', AnalysisStatus::Pending->value)->count();

        $summary = [
            'total_analyses'    => $total,
            'completed_analyses' => $completed,
            'failed_analyses'   => $failed,
            'pending_analyses'  => $pending,
        ];

        // ── Language breakdown ────────────────────────────────────────────
        $languageBreakdown = $this->toBreakdown(
            $baseQuery()
                ->whereNotNull('language')
                ->selectRaw('language as label, COUNT(*) as count')
                ->groupBy('language')
                ->orderByDesc('count')
                ->get()
        );

        // ── Time complexity breakdown ─────────────────────────────────────
        $timeComplexityBreakdown = $this->toBreakdown(
            $baseQuery()
                ->whereNotNull('time_complexity')
                ->selectRaw('time_complexity as label, COUNT(*) as count')
                ->groupBy('time_complexity')
                ->orderByDesc('count')
                ->get()
        );

        // ── Space complexity breakdown ────────────────────────────────────
        $spaceComplexityBreakdown = $this->toBreakdown(
            $baseQuery()
                ->whereNotNull('space_complexity')
                ->selectRaw('space_complexity as label, COUNT(*) as count')
                ->groupBy('space_complexity')
                ->orderByDesc('count')
                ->get()
        );

        // ── Detected pattern breakdown ────────────────────────────────────
        $detectedPatternBreakdown = $this->buildDetectedPatternBreakdown($user);

        // ── Trace mode breakdown ──────────────────────────────────────────
        $traceModeBreakdown = $this->toBreakdown(
            $baseQuery()
                ->whereNotNull('trace_mode')
                ->selectRaw('trace_mode as label, COUNT(*) as count')
                ->groupBy('trace_mode')
                ->orderByDesc('count')
                ->get()
        );

        // ── Recent activity ───────────────────────────────────────────────
        $recentActivity = [
            'last_7_days'  => $baseQuery()->where('created_at', '>=', now()->subDays(7))->count(),
            'last_30_days' => $baseQuery()->where('created_at', '>=', now()->subDays(30))->count(),
        ];

        // ── Latest analyses (no source_code, explanation, trace_steps, user_id) ──
        $latestAnalyses = $baseQuery()
            ->select(['id', 'title', 'language', 'status', 'time_complexity', 'created_at'])
            ->latest()
            ->limit(5)
            ->get()
            ->map(fn ($analysis) => [
                'id'              => $analysis->id,
                'title'           => $analysis->title,
                'language'        => $analysis->language,
                'status'          => $analysis->status instanceof AnalysisStatus
                    ? $analysis->status->value
                    : $analysis->status,
                'time_complexity' => $analysis->time_complexity,
                'created_at'      => $analysis->created_at,
            ])
            ->values()
            ->toArray();

        return new DashboardAnalyticsData(
            summary: $summary,
            languageBreakdown: $languageBreakdown,
            timeComplexityBreakdown: $timeComplexityBreakdown,
            spaceComplexityBreakdown: $spaceComplexityBreakdown,
            detectedPatternBreakdown: $detectedPatternBreakdown,
            traceModeBreakdown: $traceModeBreakdown,
            recentActivity: $recentActivity,
            latestAnalyses: $latestAnalyses,
        );
    }

    /**
     * Flatten and count all pattern strings across all detected_patterns arrays
     * for the user. Ignores null/empty values. Returns sorted descending by count.
     */
    private function buildDetectedPatternBreakdown(User $user): array
    {
        $patterns = $user->analyses()
            ->whereNotNull('detected_patterns')
            ->pluck('detected_patterns');

        $counts = [];

        foreach ($patterns as $patternList) {
            if (!is_array($patternList)) {
                continue;
            }

            foreach ($patternList as $pattern) {
                if (!is_string($pattern) || trim($pattern) === '') {
                    continue;
                }
                $counts[$pattern] = ($counts[$pattern] ?? 0) + 1;
            }
        }

        arsort($counts);

        return array_values(
            array_map(
                fn (string $label, int $count) => ['label' => $label, 'count' => $count],
                array_keys($counts),
                $counts,
            )
        );
    }

    /**
     * Convert a query result collection with 'label' and 'count' columns
     * into the standard breakdown array format.
     */
    private function toBreakdown(Collection $items): array
    {
        return $items
            ->map(fn ($item) => [
                'label' => $item->label,
                'count' => (int) $item->count,
            ])
            ->values()
            ->toArray();
    }
}
