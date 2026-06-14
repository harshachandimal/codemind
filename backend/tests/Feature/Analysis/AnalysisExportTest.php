<?php

namespace Tests\Feature\Analysis;

use App\Models\Analysis;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AnalysisExportTest extends TestCase
{
    use RefreshDatabase;

    // -------------------------------------------------------------------------
    // A) Markdown export — owner
    // -------------------------------------------------------------------------

    public function test_user_can_export_own_analysis_as_markdown(): void
    {
        $user     = User::factory()->create();
        $analysis = Analysis::factory()->withExecutedTrace()->create(['user_id' => $user->id]);

        Sanctum::actingAs($user);

        $response = $this->getJson("/api/analyses/{$analysis->id}/export?format=markdown");

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.format', 'markdown');

        $filename = $response->json('data.filename');
        $this->assertStringEndsWith('.md', $filename);

        $content = $response->json('data.content');
        $this->assertStringContainsString('# Analysis Report', $content);
        $this->assertStringContainsString('Time Complexity', $content);
        $this->assertStringContainsString('Source Code', $content);
        $this->assertStringContainsString('Runtime Trace', $content);
    }

    // -------------------------------------------------------------------------
    // B) JSON export — owner
    // -------------------------------------------------------------------------

    public function test_user_can_export_own_analysis_as_json(): void
    {
        $user     = User::factory()->create();
        $analysis = Analysis::factory()->withExecutedTrace()->create(['user_id' => $user->id]);

        Sanctum::actingAs($user);

        $response = $this->getJson("/api/analyses/{$analysis->id}/export?format=json");

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.format', 'json');

        $filename = $response->json('data.filename');
        $this->assertStringEndsWith('.json', $filename);

        $rawContent = $response->json('data.content');
        $decoded    = json_decode($rawContent, true);

        $this->assertNotNull($decoded, 'JSON content could not be decoded');
        $this->assertArrayHasKey('title', $decoded);
        $this->assertArrayNotHasKey('user_id', $decoded);
    }

    // -------------------------------------------------------------------------
    // C) Default format is markdown
    // -------------------------------------------------------------------------

    public function test_defaults_to_markdown_when_format_missing(): void
    {
        $user     = User::factory()->create();
        $analysis = Analysis::factory()->create(['user_id' => $user->id]);

        Sanctum::actingAs($user);

        $response = $this->getJson("/api/analyses/{$analysis->id}/export");

        $response->assertStatus(200)
            ->assertJsonPath('data.format', 'markdown');
    }

    // -------------------------------------------------------------------------
    // D) Unsupported format returns 422
    // -------------------------------------------------------------------------

    public function test_rejects_unsupported_format(): void
    {
        $user     = User::factory()->create();
        $analysis = Analysis::factory()->create(['user_id' => $user->id]);

        Sanctum::actingAs($user);

        $response = $this->getJson("/api/analyses/{$analysis->id}/export?format=pdf");

        $response->assertStatus(422);
    }

    // -------------------------------------------------------------------------
    // E) Another user cannot export someone else's analysis
    // -------------------------------------------------------------------------

    public function test_user_cannot_export_another_users_analysis(): void
    {
        $owner       = User::factory()->create();
        $anotherUser = User::factory()->create();
        $analysis    = Analysis::factory()->create(['user_id' => $owner->id]);

        Sanctum::actingAs($anotherUser);

        $response = $this->getJson("/api/analyses/{$analysis->id}/export?format=markdown");

        $response->assertStatus(403);
    }

    // -------------------------------------------------------------------------
    // F) Unauthenticated user cannot export
    // -------------------------------------------------------------------------

    public function test_unauthenticated_user_cannot_export(): void
    {
        $owner    = User::factory()->create();
        $analysis = Analysis::factory()->create(['user_id' => $owner->id]);

        $response = $this->getJson("/api/analyses/{$analysis->id}/export?format=markdown");

        $response->assertStatus(401);
    }
}
