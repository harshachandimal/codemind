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

        if (strtolower($data['language']) === 'javascript') {
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
            $traceMode = 'unsupported_language';
            $traceSteps = [];
            $traceSummary = null;
            $traceResult = null;
            $tracePlan = null;
            $traceError = 'Runtime tracing is currently available for JavaScript only. Static complexity analysis is available for this language.';
            $traceMetadata = null;
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
}
