<?php

namespace App\Actions\Analysis;

use App\Enums\AnalysisStatus;
use App\Models\Analysis;
use App\Models\User;
use App\Services\Analysis\ComplexityEstimatorService;
use App\Services\Trace\TracerClient;
use App\DTOs\Trace\TraceRequestData;

class StoreAnalysisAction
{
    public function __construct(
        private readonly ComplexityEstimatorService $complexityEstimatorService,
        private readonly TracerClient $tracerClient
    ) {
    }

    public function execute(User $user, array $data): Analysis
    {
        $result = $this->complexityEstimatorService->estimate(
            $data['source_code'],
            $data['language']
        );

        if ($this->shouldRequestRuntimeTrace($data['language'])) {
            $traceRequest = new TraceRequestData(
                language: $data['language'],
                sourceCode: $data['source_code'],
                entryFunction: $data['entryFunction'] ?? null,
                input: $data['input'] ?? []
            );

            $traceResponse = $this->tracerClient->trace($traceRequest);
            $traceMode = $traceResponse->mode;
            $traceSteps = $traceResponse->trace['steps'] ?? [];
            $traceSummary = $traceResponse->trace['summary'] ?? null;
            $traceResult = $traceResponse->result;
            $tracePlan = $traceResponse->plan;
            $traceError = $traceResponse->error;
            $traceMetadata = $traceResponse->metadata;
        } else {
            $lang = strtolower($data['language']);
            if ($lang === 'python') {
                $traceMode = 'planned'; // Or unsupported_language depending on convention, prompt says planned or unsupported. I'll use 'planned'. Wait, prompt suggests 'unsupported_language' or 'planned'.
                $traceSteps = [];
                $traceSummary = null;
                $traceResult = null;
                $tracePlan = null;
                $traceError = [
                    'code' => 'PYTHON_RUNTIME_TRACE_DISABLED',
                    'message' => 'Python runtime tracing is currently disabled. Static complexity analysis is available.'
                ];
                $traceMetadata = null;
            } elseif ($lang === 'java') {
                $traceMode = 'planned';
                $traceSteps = [];
                $traceSummary = null;
                $traceResult = null;
                $tracePlan = null;
                $traceError = [
                    'code' => 'JAVA_RUNTIME_TRACE_DISABLED',
                    'message' => 'Java runtime tracing is currently disabled. Static complexity analysis is available.'
                ];
                $traceMetadata = null;
            } else {
                // If tracer is disabled globally but it's JS, the TracerClient itself handles this if called. 
                // However, since shouldRequestRuntimeTrace returns false for JS if globally disabled, we need a default disabled response here.
                $traceMode = 'planned';
                $traceSteps = [];
                $traceSummary = null;
                $traceResult = null;
                $tracePlan = null;
                $traceError = [
                    'code' => 'TRACER_DISABLED',
                    'message' => 'Runtime tracing is currently disabled globally. Static complexity analysis is available.'
                ];
                $traceMetadata = null;
            }
        }

        return Analysis::create([
            'user_id'           => $user->id,
            'title'             => $data['title'] ?? null,
            'language'          => $data['language'],
            'source_code'       => $data['source_code'],
            'status'            => AnalysisStatus::Completed,
            'time_complexity'   => $result->timeComplexity,
            'space_complexity'  => $result->spaceComplexity,
            'detected_patterns' => $result->detectedPatterns,
            'explanation'       => $result->explanation,
            'trace_mode'        => $traceMode,
            'trace_steps'       => $traceSteps,
            'trace_summary'     => $traceSummary,
            'trace_result'      => $traceResult,
            'trace_plan'        => $tracePlan,
            'trace_error'       => $traceError,
            'trace_metadata'    => $traceMetadata,
        ]);
    }

    private function shouldRequestRuntimeTrace(string $language): bool
    {
        if (!config('tracer.enabled')) {
            return false;
        }

        return match (strtolower($language)) {
            'javascript' => true,
            'python' => (bool) config('tracer.python_enabled'),
            'java' => (bool) config('tracer.java_enabled'),
            default => false,
        };
    }
}
