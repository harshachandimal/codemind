<?php

namespace App\Support;

use Illuminate\Http\JsonResponse;

class ApiResponse
{
    /**
     * Return a standardised success response.
     *
     * Shape:
     * {
     *   "success": true,
     *   "message": "...",
     *   "data": { ... }
     * }
     */
    public static function success(
        string $message = 'Request successful.',
        array $data = [],
        int $status = 200,
    ): JsonResponse {
        return response()->json([
            'success' => true,
            'message' => $message,
            'data'    => $data,
        ], $status);
    }

    /**
     * Return a standardised error response.
     *
     * Shape:
     * {
     *   "success": false,
     *   "message": "...",
     *   "errors": { ... }
     * }
     */
    public static function error(
        string $message = 'An error occurred.',
        array $errors = [],
        int $status = 500,
    ): JsonResponse {
        return response()->json([
            'success' => false,
            'message' => $message,
            'errors'  => $errors,
        ], $status);
    }
}
