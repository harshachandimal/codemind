<?php

namespace App\Actions\Analysis;

use App\Enums\AnalysisStatus;
use App\Models\Analysis;
use App\Models\User;

class StoreAnalysisAction
{
    public function execute(User $user, array $data): Analysis
    {
        return Analysis::create([
            'user_id' => $user->id,
            'title' => $data['title'] ?? null,
            'language' => $data['language'],
            'source_code' => $data['source_code'],
            'status' => AnalysisStatus::Completed,
            'time_complexity' => 'O(n)',
            'space_complexity' => 'O(1)',
            'detected_patterns' => ['stubbed_analysis', 'single_loop'],
            'explanation' => 'This is a placeholder analysis result. Real complexity detection will be added in Phase 6.',
        ]);
    }
}
