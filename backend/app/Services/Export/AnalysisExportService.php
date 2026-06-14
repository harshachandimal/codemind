<?php

namespace App\Services\Export;

use App\DTOs\Export\AnalysisExportData;
use App\Models\Analysis;
use Illuminate\Validation\ValidationException;

class AnalysisExportService
{
    /**
     * Export an analysis in the specified format.
     *
     * @param  Analysis  $analysis
     * @param  string    $format  'markdown' or 'json'
     * @return AnalysisExportData
     *
     * @throws ValidationException  If the format is not supported.
     */
    public function export(Analysis $analysis, string $format): AnalysisExportData
    {
        return match ($format) {
            'markdown' => $this->exportMarkdown($analysis),
            'json'     => $this->exportJson($analysis),
            default    => throw ValidationException::withMessages([
                'format' => 'Unsupported export format.',
            ]),
        };
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    private function exportMarkdown(Analysis $analysis): AnalysisExportData
    {
        $title    = $analysis->title ?? 'Untitled';
        $language = $analysis->language ?? 'unknown';
        $status   = $analysis->status instanceof \BackedEnum
            ? $analysis->status->value
            : (string) $analysis->status;

        // --- Overview ---
        $lines   = [];
        $lines[] = "# Analysis Report: {$title}";
        $lines[] = '';
        $lines[] = '## Overview';
        $lines[] = '';
        $lines[] = "- **Language:** {$language}";
        $lines[] = "- **Status:** {$status}";
        $lines[] = '- **Time Complexity:** ' . ($analysis->time_complexity ?? 'N/A');
        $lines[] = '- **Space Complexity:** ' . ($analysis->space_complexity ?? 'N/A');

        // --- Detected Patterns ---
        $lines[] = '';
        $lines[] = '## Detected Patterns';
        $lines[] = '';
        $patterns = $analysis->detected_patterns ?? [];
        if (! empty($patterns)) {
            foreach ($patterns as $pattern) {
                $lines[] = "- {$pattern}";
            }
        } else {
            $lines[] = 'Not available.';
        }

        // --- Explanation ---
        $lines[] = '';
        $lines[] = '## Explanation';
        $lines[] = '';
        $lines[] = $analysis->explanation ?? 'Not available.';

        // --- Source Code ---
        $lines[] = '';
        $lines[] = '## Source Code';
        $lines[] = '';
        $lines[] = "```{$language}";
        $lines[] = $analysis->source_code ?? '';
        $lines[] = '```';

        // --- Runtime Trace ---
        $lines[]     = '';
        $lines[]     = '## Runtime Trace';
        $lines[]     = '';
        $traceMode   = $analysis->trace_mode;
        $traceSummary = $analysis->trace_summary;
        $traceResult  = $analysis->trace_result;

        if ($traceMode !== null) {
            $totalSteps       = $traceSummary['totalSteps']       ?? 'N/A';
            $terminatedReason = $traceSummary['terminatedReason'] ?? 'N/A';
            $returnedValue    = $traceResult['returnedValue']     ?? 'N/A';

            if (is_array($returnedValue)) {
                $returnedValue = json_encode($returnedValue);
            }

            $lines[] = "- **Mode:** {$traceMode}";
            $lines[] = "- **Total Steps:** {$totalSteps}";
            $lines[] = "- **Terminated Reason:** {$terminatedReason}";
            $lines[] = "- **Returned Value:** {$returnedValue}";
        } else {
            $lines[] = 'Not available.';
        }

        // --- Runtime Trace Steps ---
        $lines[]    = '';
        $lines[]    = '## Runtime Trace Steps';
        $lines[]    = '';
        $traceSteps = $analysis->trace_steps ?? [];
        if (! empty($traceSteps)) {
            $i = 1;
            foreach ($traceSteps as $step) {
                $description = $step['description'] ?? 'Step ' . $i;
                $lines[]     = "{$i}. {$description}";
                $i++;
            }
        } else {
            $lines[] = 'Not available.';
        }

        $content  = implode("\n", $lines) . "\n";
        $filename = $this->buildFilename($analysis->title, 'md');

        return new AnalysisExportData(
            filename: $filename,
            format: 'markdown',
            mimeType: 'text/markdown',
            content: $content,
        );
    }

    private function exportJson(Analysis $analysis): AnalysisExportData
    {
        $payload = [
            'id'                => $analysis->id,
            'title'             => $analysis->title,
            'language'          => $analysis->language,
            'status'            => $analysis->status instanceof \BackedEnum
                ? $analysis->status->value
                : (string) $analysis->status,
            'time_complexity'   => $analysis->time_complexity,
            'space_complexity'  => $analysis->space_complexity,
            'detected_patterns' => $analysis->detected_patterns,
            'explanation'       => $analysis->explanation,
            'source_code'       => $analysis->source_code,
            'trace_mode'        => $analysis->trace_mode,
            'trace_summary'     => $analysis->trace_summary,
            'trace_result'      => $analysis->trace_result,
            'trace_error'       => $analysis->trace_error,
            'trace_metadata'    => $analysis->trace_metadata,
            'exported_at'       => now()->toIso8601String(),
        ];

        $content  = json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        $filename = $this->buildFilename($analysis->title, 'json');

        return new AnalysisExportData(
            filename: $filename,
            format: 'json',
            mimeType: 'application/json',
            content: $content,
        );
    }

    /**
     * Build a filesystem-safe filename from an analysis title.
     *
     * Rules:
     *  - Lowercase
     *  - Spaces replaced with hyphens
     *  - Only alphanumeric chars and hyphens kept
     *  - Trimmed to 80 characters (excluding extension)
     *  - Falls back to 'analysis-report' when empty
     */
    private function buildFilename(string|null $title, string $extension): string
    {
        $slug = mb_strtolower((string) $title);
        $slug = str_replace(' ', '-', $slug);
        // Remove any character that is not alphanumeric or a hyphen
        $slug = preg_replace('/[^a-z0-9\-]/', '', $slug);
        // Collapse consecutive hyphens
        $slug = preg_replace('/-{2,}/', '-', $slug);
        $slug = trim($slug, '-');

        if ($slug === '') {
            $slug = 'analysis-report';
        }

        // Limit slug length
        if (mb_strlen($slug) > 80) {
            $slug = mb_substr($slug, 0, 80);
            $slug = rtrim($slug, '-');
        }

        return "{$slug}.{$extension}";
    }
}
