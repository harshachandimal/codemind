<?php

namespace App\DTOs\Trace;

class TraceResponseData
{
    public function __construct(
        public readonly bool $success,
        public readonly bool $executionEnabled,
        public readonly string $mode,
        public readonly string $message,
        public readonly array $trace,
        public readonly ?array $result,
        public readonly ?array $plan,
        public readonly ?array $error,
        public readonly array $metadata
    ) {}

    public static function fromArray(array $data): self
    {
        return new self(
            success: $data['success'] ?? false,
            executionEnabled: $data['executionEnabled'] ?? false,
            mode: $data['mode'] ?? 'error',
            message: $data['message'] ?? 'Tracer returned an invalid response.',
            trace: $data['trace'] ?? ['steps' => [], 'summary' => ['totalSteps' => 0, 'terminatedReason' => 'error']],
            result: array_key_exists('result', $data) ? $data['result'] : null,
            plan: array_key_exists('plan', $data) ? $data['plan'] : null,
            error: array_key_exists('error', $data) ? $data['error'] : ['code' => 'INVALID_TRACER_RESPONSE', 'message' => 'Tracer returned an invalid response.'],
            metadata: $data['metadata'] ?? []
        );
    }
}
