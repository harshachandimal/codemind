<?php

use App\Http\Controllers\Auth\AuthController;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Analysis\AnalysisController;
use App\Http\Controllers\Analysis\AnalysisExportController;
use App\Http\Controllers\Api\AnalysisShareController;
use App\Http\Controllers\Api\DashboardAnalyticsController;

/*
|--------------------------------------------------------------------------
| Health Check
|--------------------------------------------------------------------------
|
| A simple endpoint to verify the API is running and the database
| is reachable. No authentication required.
|
*/

Route::get('/health', function () {
    try {
        DB::connection()->getPdo();
        $dbStatus = 'connected';
    } catch (\Exception $e) {
        return ApiResponse::error(
            message: 'Database connection failed.',
            errors: ['database' => 'disconnected'],
            status: 500,
        );
    }

    return ApiResponse::success(
        message: 'API is healthy.',
        data: [
            'app'      => 'CodeMind API',
            'database' => $dbStatus,
        ],
    );
});

/*
|--------------------------------------------------------------------------
| Auth Routes — Guest (No authentication required)
|--------------------------------------------------------------------------
*/

Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login',    [AuthController::class, 'login']);
});

/*
|--------------------------------------------------------------------------
| Auth Routes — Protected (auth:sanctum required)
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->prefix('auth')->group(function () {
    Route::get('/me',      [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
});

/*
|--------------------------------------------------------------------------
| Authenticated Routes
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::get('/analyses', [AnalysisController::class, 'index']);
    Route::post('/analyses', [AnalysisController::class, 'store']);
    Route::get('/analyses/{analysis}/export', [AnalysisExportController::class, 'show']);
    Route::get('/analyses/{analysis}', [AnalysisController::class, 'show']);
    Route::delete('/analyses/{analysis}', [AnalysisController::class, 'destroy']);

    // Share Routes
    Route::post('/analyses/{analysis}/share', [AnalysisShareController::class, 'store']);
    Route::delete('/analyses/{analysis}/share', [AnalysisShareController::class, 'destroy']);

    // Dashboard
    Route::get('/dashboard/analytics', [DashboardAnalyticsController::class, 'show']);
});

/*
|--------------------------------------------------------------------------
| Public Share Routes
|--------------------------------------------------------------------------
*/

Route::get('/shared/analyses/{token}', [AnalysisShareController::class, 'show']);

