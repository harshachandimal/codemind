<?php

namespace App\Http\Controllers\Analysis;

use App\Http\Controllers\Controller;
use App\Models\Analysis;
use App\Services\Export\AnalysisExportService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnalysisExportController extends Controller
{
    /**
     * Export an analysis as markdown or JSON.
     *
     * GET /api/analyses/{analysis}/export?format=markdown
     * GET /api/analyses/{analysis}/export?format=json
     *
     * Only the owner of the analysis may export it.
     */
    public function show(
        Request $request,
        Analysis $analysis,
        AnalysisExportService $exportService,
    ): JsonResponse {
        // Ownership check — consistent with AnalysisController
        if ($analysis->user_id !== $request->user()->id) {
            abort(403);
        }

        // Validate format query param; default to 'markdown'
        $validated = $request->validate([
            'format' => ['nullable', 'string', 'in:markdown,json'],
        ]);

        $format = $validated['format'] ?? 'markdown';

        $export = $exportService->export($analysis, $format);

        return ApiResponse::success(
            message: 'Analysis export generated successfully.',
            data: $export->toArray(),
        );
    }
}
