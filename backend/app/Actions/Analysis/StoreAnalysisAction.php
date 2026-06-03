<?php

namespace App\Actions\Analysis;

use App\Enums\AnalysisStatus;
use App\Models\Analysis;
use App\Models\User;
use App\Services\Analysis\ComplexityEstimatorService;

class StoreAnalysisAction
{
    public function __construct(
        private readonly ComplexityEstimatorService $complexityEstimatorService
    ) {
    }

    public function execute(User $user, array $data): Analysis
    {
        $result = $this->complexityEstimatorService->estimate(
            $data['source_code'],
            $data['language']
        );

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
        ]);
    }
}
