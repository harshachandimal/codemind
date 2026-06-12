<?php

namespace App\DTOs\Trace;

class TraceRequestData
{
    public function __construct(
        public readonly string $language,
        public readonly string $sourceCode,
        public readonly ?string $entryFunction,
        public readonly array $input
    ) {}

    public function toArray(): array
    {
        return array_filter([
            'language' => $this->language,
            'sourceCode' => $this->sourceCode,
            'entryFunction' => $this->entryFunction,
            'input' => $this->input,
        ], fn($val) => $val !== null);
    }
}
