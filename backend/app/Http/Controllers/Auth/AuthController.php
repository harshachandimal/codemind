<?php

namespace App\Http\Controllers\Auth;

use App\Actions\Auth\LoginUserAction;
use App\Actions\Auth\RegisterUserAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\Auth\AuthUserResource;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    /**
     * Handle a registration request.
     *
     * POST /api/auth/register
     */
    public function register(
        RegisterRequest $request,
        RegisterUserAction $registerUserAction,
    ): JsonResponse {
        $result = $registerUserAction->execute($request->validated());

        return ApiResponse::success(
            message: 'Registration successful.',
            data: [
                'user'  => new AuthUserResource($result['user']),
                'token' => $result['token'],
            ],
            status: 201,
        );
    }

    /**
     * Handle a login request.
     *
     * POST /api/auth/login
     */
    public function login(
        LoginRequest $request,
        LoginUserAction $loginUserAction,
    ): JsonResponse {
        $result = $loginUserAction->execute($request->validated());

        return ApiResponse::success(
            message: 'Login successful.',
            data: [
                'user'  => new AuthUserResource($result['user']),
                'token' => $result['token'],
            ],
            status: 200,
        );
    }

    /**
     * Return the currently authenticated user.
     *
     * GET /api/auth/me
     */
    public function me(Request $request): JsonResponse
    {
        return ApiResponse::success(
            message: 'Authenticated user retrieved.',
            data: [
                'user' => new AuthUserResource($request->user()),
            ],
        );
    }

    /**
     * Revoke the current access token (logout).
     *
     * POST /api/auth/logout
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return ApiResponse::success(
            message: 'Logout successful.',
            data: [],
        );
    }
}
