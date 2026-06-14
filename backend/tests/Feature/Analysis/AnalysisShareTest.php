<?php

namespace Tests\Feature\Analysis;

use App\Models\Analysis;
use App\Models\AnalysisShare;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AnalysisShareTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_can_create_share_link()
    {
        $user = User::factory()->create();
        $analysis = Analysis::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)->postJson("/api/analyses/{$analysis->id}/share");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'status',
                'data' => ['token', 'share_url', 'expires_at'],
            ]);

        $this->assertDatabaseHas('analysis_shares', [
            'analysis_id' => $analysis->id,
        ]);

        $token = $response->json('data.token');
        $share = AnalysisShare::first();
        
        $this->assertNotEquals($token, $share->token_hash);
        $this->assertEquals(hash('sha256', $token), $share->token_hash);
    }

    public function test_user_cannot_create_share_link_for_another_users_analysis()
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $analysis = Analysis::factory()->create(['user_id' => $owner->id]);

        $response = $this->actingAs($otherUser)->postJson("/api/analyses/{$analysis->id}/share");

        $response->assertStatus(403);
    }

    public function test_public_user_can_view_shared_analysis_with_valid_token()
    {
        $user = User::factory()->create();
        $analysis = Analysis::factory()->create([
            'user_id' => $user->id,
            'title' => 'Secret Algorithm',
        ]);

        $response = $this->actingAs($user)->postJson("/api/analyses/{$analysis->id}/share");
        $token = $response->json('data.token');

        $publicResponse = $this->getJson("/api/shared/analyses/{$token}");

        $publicResponse->assertStatus(200)
            ->assertJsonPath('data.title', 'Secret Algorithm')
            ->assertJsonMissing(['user_id' => $user->id])
            ->assertJsonMissing(['token_hash' => hash('sha256', $token)]);
    }

    public function test_invalid_share_token_returns_404()
    {
        $response = $this->getJson('/api/shared/analyses/invalid-token-123');

        $response->assertStatus(404);
    }

    public function test_revoked_share_token_returns_404()
    {
        $user = User::factory()->create();
        $analysis = Analysis::factory()->create(['user_id' => $user->id]);

        // Create share
        $createResponse = $this->actingAs($user)->postJson("/api/analyses/{$analysis->id}/share");
        $token = $createResponse->json('data.token');

        // Revoke share
        $this->actingAs($user)->deleteJson("/api/analyses/{$analysis->id}/share");

        // Try to view
        $publicResponse = $this->getJson("/api/shared/analyses/{$token}");

        $publicResponse->assertStatus(404);
    }

    public function test_expired_share_token_returns_404()
    {
        $user = User::factory()->create();
        $analysis = Analysis::factory()->create(['user_id' => $user->id]);

        $analysis->shares()->create([
            'token_hash' => hash('sha256', 'some-token'),
            'expires_at' => now()->subDays(1),
        ]);

        $response = $this->getJson('/api/shared/analyses/some-token');

        $response->assertStatus(404);
    }

    public function test_unauthenticated_user_cannot_create_share_link()
    {
        $user = User::factory()->create();
        $analysis = Analysis::factory()->create(['user_id' => $user->id]);

        $response = $this->postJson("/api/analyses/{$analysis->id}/share");

        $response->assertStatus(401);
    }

    public function test_unauthenticated_user_can_view_valid_shared_link()
    {
        $user = User::factory()->create();
        $analysis = Analysis::factory()->create(['user_id' => $user->id]);

        $response = $this->actingAs($user)->postJson("/api/analyses/{$analysis->id}/share");
        $token = $response->json('data.token');

        $publicResponse = $this->getJson("/api/shared/analyses/{$token}"); // Unauthenticated

        $publicResponse->assertStatus(200);
    }
}
