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

        $traceRequest = new TraceRequestData(
            language: $data['language'],
            sourceCode: $data['source_code'],
            entryFunction: $data['entryFunction'] ?? null,
            input: $data['input'] ?? []
        );

        $traceResponse = $this->tracerClient->trace($traceRequest);

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
            'trace_mode'        => $traceResponse->mode,
            'trace_steps'       => $traceResponse->trace['steps'] ?? [],
            'trace_summary'     => $traceResponse->trace['summary'] ?? null,
            'trace_result'      => $traceResponse->result,
            'trace_plan'        => $traceResponse->plan,
            'trace_error'       => $traceResponse->error,
            'trace_metadata'    => $traceResponse->metadata,
        ]);
    }
}
