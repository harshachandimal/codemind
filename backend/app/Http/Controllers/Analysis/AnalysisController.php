<?php

namespace App\Http\Controllers\Analysis;

use App\Actions\Analysis\StoreAnalysisAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Analysis\StoreAnalysisRequest;
use App\Http\Resources\Analysis\AnalysisResource;
use App\Models\Analysis;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnalysisController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $analyses = $request->user()->analyses()->latest()->get();

        return ApiResponse::success(
            message: 'Analyses retrieved successfully.',
            data: [
                'analyses' => AnalysisResource::collection($analyses),
            ]
        );
    }

    public function store(StoreAnalysisRequest $request, StoreAnalysisAction $storeAnalysisAction): JsonResponse
    {
        $analysis = $storeAnalysisAction->execute($request->user(), $request->validated());

        return ApiResponse::success(
            message: 'Analysis created successfully.',
            data: [
                'analysis' => new AnalysisResource($analysis),
            ],
            status: 201
        );
    }

    public function show(Request $request, Analysis $analysis): JsonResponse
    {
        if ($analysis->user_id !== $request->user()->id) {
            abort(403);
        }

        return ApiResponse::success(
            message: 'Analysis retrieved successfully.',
            data: [
                'analysis' => new AnalysisResource($analysis),
            ]
        );
    }

    public function destroy(Request $request, Analysis $analysis): JsonResponse
    {
        if ($analysis->user_id !== $request->user()->id) {
            abort(403);
        }

        $analysis->delete();

        return ApiResponse::success(
            message: 'Analysis deleted successfully.',
            data: []
        );
    }
}
