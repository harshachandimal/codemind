<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateUserSettingsRequest;
use App\Services\User\UserSettingsService;
use App\Support\ApiResponse;
use Illuminate\Http\Request;

class UserSettingsController extends Controller
{
    public function show(Request $request, UserSettingsService $service)
    {
        $settings = $service->getOrCreateForUser($request->user());
        
        return ApiResponse::success(
            data: $service->toData($settings)->toArray(),
            message: 'User settings loaded successfully.'
        );
    }

    public function update(UpdateUserSettingsRequest $request, UserSettingsService $service)
    {
        $settings = $service->updateForUser($request->user(), $request->validated());
        
        return ApiResponse::success(
            data: $service->toData($settings)->toArray(),
            message: 'User settings updated successfully.'
        );
    }
}
