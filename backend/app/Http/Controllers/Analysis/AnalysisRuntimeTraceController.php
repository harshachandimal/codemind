<?php

namespace App\Http\Controllers\Analysis;

use App\Actions\Analysis\RunAnalysisRuntimeTraceAction;
use App\Http\Controllers\Controller;
use App\Http\Resources\Analysis\AnalysisResource;
use App\Models\Analysis;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnalysisRuntimeTraceController extends Controller
{
    /**
     * POST /api/analyses/{analysis}/runtime-trace
     *
     * Run (or re-run) the runtime trace for a saved analysis.
     * The Laravel backend never executes submitted code directly.
     * It delegates to the TracerClient which calls the tracer service via HTTP.
     */
    public function store(
        Request $request,
        Analysis $analysis,
        RunAnalysisRuntimeTraceAction $action
    ): JsonResponse {
        // Ownership check — 403 if analysis does not belong to the authenticated user
        if ($analysis->user_id !== $request->user()->id) {
            abort(403);
        }

        $validated = $request->validate([
            'entryFunction' => ['nullable', 'string', 'max:255'],
            'input'         => ['nullable', 'array'],
        ]);

        $updated = $action->execute(
            analysis:      $analysis,
            entryFunction: $validated['entryFunction'] ?? null,
            input:         array_key_exists('input', $validated) ? $validated['input'] : null
        );

        return ApiResponse::success(
            message: 'Runtime trace completed.',
            data: [
                'analysis' => new AnalysisResource($updated),
            ]
        );
    }
}
