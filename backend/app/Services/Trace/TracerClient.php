<?php

namespace App\Services\Trace;

use App\DTOs\Trace\TraceRequestData;
use App\DTOs\Trace\TraceResponseData;
use Illuminate\Support\Facades\Http;
use Throwable;

class TracerClient
{
    public function isEnabled(): bool
    {
        return (bool) config('tracer.enabled', false);
    }

    public function health(): array
    {
        if (!$this->isEnabled()) {
            return [
                'success' => false,
                'enabled' => false,
                'message' => 'Tracer integration is disabled.',
            ];
        }

        try {
            $response = Http::timeout((int) config('tracer.timeout_seconds', 5))
                ->get(config('tracer.service_url') . '/health');

            if ($response->successful()) {
                return $response->json();
            }

            return [
                'success' => false,
                'enabled' => true,
                'message' => 'Tracer health check failed.',
            ];
        } catch (Throwable $e) {
            return [
                'success' => false,
                'enabled' => true,
                'message' => 'Tracer health check failed to connect.',
            ];
        }
    }

    public function trace(TraceRequestData $request): TraceResponseData
    {
        if (!$this->isEnabled()) {
            return TraceResponseData::fromArray([
                'success' => false,
                'executionEnabled' => false,
                'mode' => 'planned',
                'message' => 'Tracer integration is disabled in Laravel.',
                'trace' => [
                    'steps' => [],
                    'summary' => [
                        'totalSteps' => 0,
                        'terminatedReason' => 'not_executed',
                    ],
                ],
                'result' => null,
                'plan' => null,
                'error' => null,
                'metadata' => [
                    'language' => $request->language,
                    'entryFunction' => $request->entryFunction,
                ],
            ]);
        }

        try {
            $response = Http::timeout((int) config('tracer.timeout_seconds', 5))
                ->post(config('tracer.service_url') . '/trace', $request->toArray());

            if ($response->successful()) {
                return TraceResponseData::fromArray($response->json());
            }

            return TraceResponseData::fromArray([
                'success' => false,
                'executionEnabled' => false,
                'mode' => 'error',
                'message' => 'Tracer service returned an error.',
                'error' => [
                    'code' => 'TRACER_ERROR',
                    'message' => 'Tracer service returned an error response.'
                ],
            ]);
        } catch (Throwable $e) {
            return TraceResponseData::fromArray([
                'success' => false,
                'executionEnabled' => false,
                'mode' => 'error',
                'message' => 'Tracer service is unavailable.',
                'error' => [
                    'code' => 'TRACER_UNAVAILABLE',
                    'message' => 'Tracer service is unavailable.'
                ],
            ]);
        }
    }
}
