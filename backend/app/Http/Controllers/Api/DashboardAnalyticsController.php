<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\Dashboard\DashboardAnalyticsService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardAnalyticsController extends Controller
{
    /**
     * Return dashboard analytics for the authenticated user.
     * Source code is never selected, executed, or returned.
     */
    public function show(Request $request, DashboardAnalyticsService $service): JsonResponse
    {
        $user      = $request->user();
        $analytics = $service->getForUser($user);

        return ApiResponse::success(
            data: $analytics->toArray(),
            message: 'Dashboard analytics loaded successfully.',
        );
    }
}
