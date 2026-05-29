<?php

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
| Authenticated Routes
|--------------------------------------------------------------------------
*/

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

