<?php

namespace App\DTOs\Export;

class AnalysisExportData
{
    public function __construct(
        public readonly string $filename,
        public readonly string $format,
        public readonly string $mimeType,
        public readonly string $content,
    ) {
    }

    public function toArray(): array
    {
        return [
            'filename'  => $this->filename,
            'format'    => $this->format,
            'mime_type' => $this->mimeType,
            'content'   => $this->content,
        ];
    }
}
