<?php

namespace App\DTOs\User;

class UserSettingsData
{
    public function __construct(
        public readonly string $defaultLanguage,
        public readonly int $editorFontSize,
        public readonly bool $showVisualExplanations,
        public readonly bool $showRuntimeTrace,
        public readonly string $dashboardDensity,
    ) {
    }

    public function toArray(): array
    {
        return [
            'default_language' => $this->defaultLanguage,
            'editor_font_size' => $this->editorFontSize,
            'show_visual_explanations' => $this->showVisualExplanations,
            'show_runtime_trace' => $this->showRuntimeTrace,
            'dashboard_density' => $this->dashboardDensity,
        ];
    }
}
