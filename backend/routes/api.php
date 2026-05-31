<?php

use App\Http\Controllers\Auth\AuthController;
use App\Support\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;

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

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

