<?php

namespace Tests\Feature\User;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserSettingsTest extends TestCase
{
    use RefreshDatabase;

    public function test_authenticated_user_can_get_default_settings()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->getJson('/api/user/settings');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'default_language' => 'javascript',
                    'editor_font_size' => 14,
                    'show_visual_explanations' => true,
                    'show_runtime_trace' => true,
                    'dashboard_density' => 'comfortable',
                ]
            ]);

        $this->assertDatabaseHas('user_settings', [
            'user_id' => $user->id,
            'default_language' => 'javascript',
            'editor_font_size' => 14,
        ]);
    }

    public function test_authenticated_user_can_update_settings()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->patchJson('/api/user/settings', [
            'default_language' => 'python',
            'editor_font_size' => 18,
            'show_visual_explanations' => false,
            'show_runtime_trace' => false,
            'dashboard_density' => 'compact',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'data' => [
                    'default_language' => 'python',
                    'editor_font_size' => 18,
                    'show_visual_explanations' => false,
                    'show_runtime_trace' => false,
                    'dashboard_density' => 'compact',
                ]
            ]);

        $this->assertDatabaseHas('user_settings', [
            'user_id' => $user->id,
            'default_language' => 'python',
            'editor_font_size' => 18,
            'show_visual_explanations' => false,
            'show_runtime_trace' => false,
            'dashboard_density' => 'compact',
        ]);
    }

    public function test_partial_update_only_changes_provided_fields()
    {
        $user = User::factory()->create();

        // Get to create defaults
        $this->actingAs($user)->getJson('/api/user/settings');

        $response = $this->actingAs($user)->patchJson('/api/user/settings', [
            'editor_font_size' => 16,
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.editor_font_size', 16)
            ->assertJsonPath('data.default_language', 'javascript');
    }

    public function test_invalid_settings_are_rejected()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->patchJson('/api/user/settings', [
            'default_language' => 'ruby',
            'editor_font_size' => 99,
            'dashboard_density' => 'tiny',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['default_language', 'editor_font_size', 'dashboard_density']);
    }

    public function test_unauthenticated_user_cannot_get_settings()
    {
        $response = $this->getJson('/api/user/settings');
        $response->assertStatus(401);
    }

    public function test_unauthenticated_user_cannot_update_settings()
    {
        $response = $this->patchJson('/api/user/settings', [
            'editor_font_size' => 16,
        ]);
        $response->assertStatus(401);
    }

    public function test_users_cannot_access_each_others_settings()
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        // Update user 1 settings
        $this->actingAs($user1)->patchJson('/api/user/settings', [
            'editor_font_size' => 20,
        ]);

        // Get user 2 settings, should be defaults
        $response = $this->actingAs($user2)->getJson('/api/user/settings');
        $response->assertStatus(200)
            ->assertJsonPath('data.editor_font_size', 14);
    }
}
