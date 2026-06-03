<?php

namespace Tests\Feature\Analysis;

use App\Enums\AnalysisStatus;
use App\Models\Analysis;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AnalysisApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_unauthenticated_user_cannot_access_analysis_routes()
    {
        $response = $this->getJson('/api/analyses');
        $response->assertStatus(401);

        $response = $this->postJson('/api/analyses', []);
        $response->assertStatus(401);
    }

    public function test_authenticated_user_can_create_analysis()
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $payload = [
            'title'       => 'Sum array function',
            'language'    => 'javascript',
            'source_code' => 'function sum(arr) { return arr.length; }',
        ];

        $response = $this->postJson('/api/analyses', $payload);

        // source_code has no loops or recursion → real analyzer returns O(1)
        $response->assertStatus(201)
            ->assertJson([
                'success' => true,
                'message' => 'Analysis created successfully.',
                'data'    => [
                    'analysis' => [
                        'title'            => 'Sum array function',
                        'language'         => 'javascript',
                        'status'           => 'completed',
                        'time_complexity'  => 'O(1)',
                        'space_complexity' => 'O(1)',
                    ]
                ]
            ]);

        $this->assertContains('constant_operations', $response->json('data.analysis.detected_patterns'));

        $this->assertDatabaseHas('analyses', [
            'user_id'  => $user->id,
            'title'    => 'Sum array function',
            'language' => 'javascript',
        ]);
    }

    public function test_create_analysis_requires_valid_data()
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/analyses', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['language', 'source_code']);
    }

    public function test_create_analysis_only_accepts_javascript_language()
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $payload = [
            'title' => 'Python script',
            'language' => 'python',
            'source_code' => 'print("hello")',
        ];

        $response = $this->postJson('/api/analyses', $payload);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['language']);
    }

    public function test_authenticated_user_can_list_only_their_own_analyses()
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();

        $analysesA = Analysis::factory()->count(2)->create(['user_id' => $userA->id]);
        $analysisB = Analysis::factory()->create(['user_id' => $userB->id]);

        Sanctum::actingAs($userA);

        $response = $this->getJson('/api/analyses');

        $response->assertStatus(200)
            ->assertSee($analysesA[0]->title)
            ->assertSee($analysesA[1]->title)
            ->assertDontSee($analysisB->title);
    }

    public function test_authenticated_user_can_view_own_analysis()
    {
        $user = User::factory()->create();
        $analysis = Analysis::factory()->create(['user_id' => $user->id]);

        Sanctum::actingAs($user);

        $response = $this->getJson("/api/analyses/{$analysis->id}");

        $response->assertStatus(200)
            ->assertJsonPath('data.analysis.id', $analysis->id)
            ->assertJsonPath('data.analysis.title', $analysis->title);
    }

    public function test_user_cannot_view_another_users_analysis()
    {
        $owner = User::factory()->create();
        $anotherUser = User::factory()->create();
        
        $analysis = Analysis::factory()->create(['user_id' => $owner->id]);

        Sanctum::actingAs($anotherUser);

        $response = $this->getJson("/api/analyses/{$analysis->id}");

        $response->assertStatus(403);
    }

    public function test_authenticated_user_can_delete_own_analysis()
    {
        $user = User::factory()->create();
        $analysis = Analysis::factory()->create(['user_id' => $user->id]);

        Sanctum::actingAs($user);

        $response = $this->deleteJson("/api/analyses/{$analysis->id}");

        $response->assertStatus(200)
            ->assertJsonFragment([
                'message' => 'Analysis deleted successfully.'
            ]);

        $this->assertDatabaseMissing('analyses', [
            'id' => $analysis->id,
        ]);
    }

    public function test_user_cannot_delete_another_users_analysis()
    {
        $owner = User::factory()->create();
        $anotherUser = User::factory()->create();
        
        $analysis = Analysis::factory()->create(['user_id' => $owner->id]);

        Sanctum::actingAs($anotherUser);

        $response = $this->deleteJson("/api/analyses/{$analysis->id}");

        $response->assertStatus(403);

        $this->assertDatabaseHas('analyses', [
            'id' => $analysis->id,
        ]);
    }
}
