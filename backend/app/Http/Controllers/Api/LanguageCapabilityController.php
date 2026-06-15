<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Support\ApiResponse;
use App\Support\LanguageCapabilities;

class LanguageCapabilityController extends Controller
{
    public function index()
    {
        return ApiResponse::success(
            message: 'Capabilities retrieved successfully.',
            data: LanguageCapabilities::getAll()
        );
    }
}
