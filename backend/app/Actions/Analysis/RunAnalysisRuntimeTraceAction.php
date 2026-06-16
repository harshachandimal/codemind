<?php

namespace App\Actions\Analysis;

use App\DTOs\Trace\TraceRequestData;
use App\Enums\AnalysisStatus;
use App\Models\Analysis;
use App\Services\Trace\TracerClient;
use Illuminate\Validation\ValidationException;

class RunAnalysisRuntimeTraceAction
{
    public function __construct(
        private readonly TracerClient $tracerClient
    ) {}

    /**
     * Run a runtime trace for an existing saved analysis.
     *
     * @param  Analysis  $analysis
     * @param  string|null  $entryFunction  Override from request (falls back to saved)
     * @param  array|null  $input          Override from request (falls back to saved)
     * @return Analysis  Updated analysis with trace fields saved
     * @throws ValidationException
     */
    public function execute(Analysis $analysis, ?string $entryFunction, ?array $input): Analysis
    {
        // Resolve entry function: request value > saved value
        $resolvedEntryFunction = $entryFunction ?? $analysis->entry_function;
        $resolvedInput         = $input !== null ? $input : ($analysis->runtime_input ?? []);

        // Check runtime flag eligibility first so we never hit the tracer when disabled
        if (!$this->shouldRequestRuntimeTrace($analysis->language)) {
            $disabledCode    = $this->getDisabledCode($analysis->language);
            $disabledMessage = $this->getDisabledMessage($analysis->language);

            $analysis->update([
                'trace_mode'  => 'planned',
                'trace_steps' => [],
                'trace_error' => ['code' => $disabledCode, 'message' => $disabledMessage],
            ]);

            return $analysis->fresh();
        }

        // Build the safe trace request (no code execution — just data assembly)
        $traceRequest = new TraceRequestData(
            language:      $analysis->language,
            sourceCode:    $analysis->source_code,
            entryFunction: $resolvedEntryFunction,
            input:         $resolvedInput
        );

        // Call tracer service via Laravel HTTP client (TracerClient sanitises all errors)
        $traceResponse = $this->tracerClient->trace($traceRequest);

        // Persist results back to the analysis row
        $analysis->update([
            'trace_mode'     => $traceResponse->mode,
            'trace_steps'    => $traceResponse->trace['steps'] ?? [],
            'trace_summary'  => $traceResponse->trace['summary'] ?? null,
            'trace_result'   => $traceResponse->result,
            'trace_plan'     => $traceResponse->plan,
            'trace_error'    => $traceResponse->error,
            'trace_metadata' => $traceResponse->metadata,
            // Persist the effective entryFunction/input used so the user can re-run later
            'entry_function' => $resolvedEntryFunction,
            'runtime_input'  => $resolvedInput ?: null,
        ]);

        return $analysis->fresh();
    }

    private function shouldRequestRuntimeTrace(string $language): bool
    {
        if (!config('tracer.enabled')) {
            return false;
        }

        return match (strtolower($language)) {
            'javascript' => true,
            'python'     => (bool) config('tracer.python_enabled'),
            'java'       => (bool) config('tracer.java_enabled'),
            default      => false,
        };
    }

    private function getDisabledCode(string $language): string
    {
        return match (strtolower($language)) {
            'python' => 'PYTHON_RUNTIME_TRACE_DISABLED',
            'java'   => 'JAVA_RUNTIME_TRACE_DISABLED',
            default  => 'TRACER_DISABLED',
        };
    }

    private function getDisabledMessage(string $language): string
    {
        return match (strtolower($language)) {
            'python' => 'Python runtime tracing is currently disabled. Static complexity analysis is available.',
            'java'   => 'Java runtime tracing is currently disabled. Static complexity analysis is available.',
            default  => 'Runtime tracing is currently disabled. Static complexity analysis is available.',
        };
    }
}
