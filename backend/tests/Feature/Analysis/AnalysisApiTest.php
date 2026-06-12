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

    public function test_analysis_response_includes_runtime_trace_fields()
    {
        $user = User::factory()->create();
        $analysis = Analysis::factory()->withExecutedTrace()->create(['user_id' => $user->id]);

        Sanctum::actingAs($user);

        $response = $this->getJson("/api/analyses/{$analysis->id}");

        $response->assertStatus(200)
            ->assertJsonPath('data.analysis.id', $analysis->id)
            ->assertJsonPath('data.analysis.trace_mode', 'executed')
            ->assertJsonPath('data.analysis.trace_steps.0.step', 1)
            ->assertJsonPath('data.analysis.trace_summary.totalSteps', 2)
            ->assertJsonPath('data.analysis.trace_result.returnedValue', 5)
            ->assertJsonPath('data.analysis.trace_metadata.language', 'javascript');
    }
    public function test_analysis_creation_stores_disabled_trace_when_tracer_disabled()
    {
        config(['tracer.enabled' => false]);
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $payload = [
            'title'       => 'Sum array function',
            'language'    => 'javascript',
            'source_code' => 'function sum(arr) { return arr.length; }',
        ];

        $response = $this->postJson('/api/analyses', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('data.analysis.trace_mode', 'planned')
            ->assertJsonPath('data.analysis.trace_steps', [])
            ->assertJsonPath('data.analysis.trace_summary.totalSteps', 0)
            ->assertJsonPath('data.analysis.trace_summary.terminatedReason', 'not_executed')
            ->assertJsonPath('data.analysis.trace_result', null)
            ->assertJsonPath('data.analysis.trace_error', null);
            
        \Illuminate\Support\Facades\Http::assertNothingSent();
    }

    public function test_analysis_creation_calls_tracer_when_enabled()
    {
        config(['tracer.enabled' => true]);
        config(['tracer.service_url' => 'http://tracer.test']);
        
        \Illuminate\Support\Facades\Http::fake([
            'http://tracer.test/trace' => \Illuminate\Support\Facades\Http::response([
                "success" => true,
                "executionEnabled" => true,
                "mode" => "executed",
                "message" => "Trace executed successfully.",
                "trace" => [
                    "steps" => [
                        [
                            "step" => 1,
                            "line" => 1,
                            "type" => "function_call",
                            "description" => "Function add was called.",
                            "variables" => [],
                            "callStack" => ["add"]
                        ],
                        [
                            "step" => 2,
                            "line" => 2,
                            "type" => "return",
                            "description" => "Function add returned 5.",
                            "variables" => [],
                            "callStack" => ["add"]
                        ]
                    ],
                    "summary" => [
                        "totalSteps" => 2,
                        "terminatedReason" => "completed"
                    ]
                ],
                "result" => [
                    "returnedValue" => 5
                ],
                "plan" => null,
                "error" => null,
                "metadata" => [
                    "language" => "javascript",
                    "entryFunction" => "add",
                    "analyzedAt" => "2026-06-11T00:00:00.000Z"
                ]
            ], 200)
        ]);

        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $payload = [
            'title'       => 'Add function',
            'language'    => 'javascript',
            'source_code' => 'function add(a, b) { return a + b; }',
            'entryFunction' => 'add',
            'input' => [2, 3]
        ];

        $response = $this->postJson('/api/analyses', $payload);

        $response->assertStatus(201)
            ->assertJsonPath('data.analysis.trace_mode', 'executed')
            ->assertJsonPath('data.analysis.trace_result.returnedValue', 5)
            ->assertJsonPath('data.analysis.trace_summary.totalSteps', 2);
            
        $this->assertCount(2, $response->json('data.analysis.trace_steps'));

        \Illuminate\Support\Facades\Http::assertSent(function ($request) {
            return $request->url() == 'http://tracer.test/trace' &&
                   $request['language'] == 'javascript' &&
                   $request['sourceCode'] == 'function add(a, b) { return a + b; }' &&
                   $request['entryFunction'] == 'add' &&
                   $request['input'] == [2, 3];
        });
    }

    public function test_analysis_creation_still_succeeds_when_tracer_unavailable()
    {
        config(['tracer.enabled' => true]);
        config(['tracer.service_url' => 'http://tracer.test']);
        
        \Illuminate\Support\Facades\Http::fake([
            'http://tracer.test/trace' => function () {
                throw new \Illuminate\Http\Client\ConnectionException("Connection failed");
            }
        ]);

        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $payload = [
            'title'       => 'Add function',
            'language'    => 'javascript',
            'source_code' => 'function add(a, b) { return a + b; }',
        ];

        $response = $this->postJson('/api/analyses', $payload);

        // Analysis succeeds despite tracer failure
        $response->assertStatus(201)
            ->assertJsonPath('data.analysis.trace_mode', 'error')
            ->assertJsonPath('data.analysis.trace_error.code', 'TRACER_UNAVAILABLE')
            ->assertJsonPath('data.analysis.time_complexity', 'O(1)'); // From standard analyzer
            
        // Assert no raw exceptions in the response message
        $this->assertStringNotContainsString('Connection failed', $response->json('message'));
    }
}
