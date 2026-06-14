<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\SharedAnalysisResource;
use App\Models\Analysis;
use App\Services\Sharing\AnalysisShareService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class AnalysisShareController extends Controller
{
    /**
     * Create a share link for an analysis.
     */
    public function store(Request $request, Analysis $analysis, AnalysisShareService $shareService): JsonResponse
    {
        // Ensure authenticated user owns analysis
        if ($request->user()->id !== $analysis->user_id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized.',
            ], 403);
        }

        $validated = $request->validate([
            'expires_in_days' => 'nullable|integer|min:1|max:30',
        ]);

        $expiresAt = null;
        if (isset($validated['expires_in_days'])) {
            $expiresAt = now()->addDays($validated['expires_in_days']);
        }

        $shareData = $shareService->createShare($analysis, $expiresAt);

        return response()->json([
            'status' => 'success',
            'data' => $shareData,
        ]);
    }

    /**
     * Revoke all active shares for an analysis.
     */
    public function destroy(Request $request, Analysis $analysis, AnalysisShareService $shareService): JsonResponse
    {
        // Ensure authenticated user owns analysis
        if ($request->user()->id !== $analysis->user_id) {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized.',
            ], 403);
        }

        $shareService->revokeShares($analysis);

        return response()->json([
            'status' => 'success',
            'message' => 'Share links revoked successfully.',
        ]);
    }

    /**
     * Display a shared analysis.
     */
    public function show(string $token, AnalysisShareService $shareService): JsonResponse
    {
        $analysis = $shareService->findSharedAnalysisByToken($token);

        if (!$analysis) {
            return response()->json([
                'status' => 'error',
                'message' => 'Shared analysis not found or link expired.',
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => new SharedAnalysisResource($analysis),
        ]);
    }
}
