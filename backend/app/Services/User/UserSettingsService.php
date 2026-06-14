<?php

namespace App\Services\User;

use App\DTOs\User\UserSettingsData;
use App\Models\User;
use App\Models\UserSetting;

class UserSettingsService
{
    public function getOrCreateForUser(User $user): UserSetting
    {
        return UserSetting::firstOrCreate(
            ['user_id' => $user->id],
            [
                'default_language' => 'javascript',
                'editor_font_size' => 14,
                'show_visual_explanations' => true,
                'show_runtime_trace' => true,
                'dashboard_density' => 'comfortable',
            ]
        );
    }

    public function updateForUser(User $user, array $data): UserSetting
    {
        $settings = $this->getOrCreateForUser($user);
        
        $settings->update($data);
        
        return $settings;
    }

    public function toData(UserSetting $settings): UserSettingsData
    {
        return new UserSettingsData(
            defaultLanguage: $settings->default_language,
            editorFontSize: $settings->editor_font_size,
            showVisualExplanations: $settings->show_visual_explanations,
            showRuntimeTrace: $settings->show_runtime_trace,
            dashboardDensity: $settings->dashboard_density
        );
    }
}
