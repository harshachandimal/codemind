<?php

namespace Tests\Feature;

use App\Models\Analysis;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AnalysisRuntimeTraceTest extends TestCase
{
    use RefreshDatabase;

    // ---------------------------------------------------------------------------
    // Helpers
    // ---------------------------------------------------------------------------

    private function fakeSuccessfulTrace(): void
    {
        Http::fake([
            'http://tracer.test/trace' => Http::response([
                'success'          => true,
                'executionEnabled' => true,
                'mode'             => 'executed',
                'message'          => 'Trace executed successfully.',
                'trace'            => [
                    'steps' => [
                        [
                            'step'        => 1,
                            'line'        => 1,
                            'type'        => 'function_call',
                            'description' => 'Function sum was called.',
                            'variables'   => [],
                            'callStack'   => ['sum'],
                        ],
                        [
                            'step'        => 2,
                            'line'        => 5,
                            'type'        => 'return',
                            'description' => 'Function sum returned 12.',
                            'variables'   => ['total' => 12],
                            'callStack'   => ['sum'],
                        ],
                    ],
                    'summary' => [
                        'totalSteps'       => 2,
                        'terminatedReason' => 'completed',
                    ],
                ],
                'result'   => ['returnedValue' => 12],
                'plan'     => null,
                'error'    => null,
                'metadata' => [
                    'language'      => 'javascript',
                    'entryFunction' => 'sum',
                ],
            ], 200),
        ]);
    }

    // ---------------------------------------------------------------------------
    // A) user_can_run_runtime_trace_for_own_saved_analysis
    // ---------------------------------------------------------------------------

    public function test_user_can_run_runtime_trace_for_own_saved_analysis(): void
    {
        config(['tracer.enabled' => true, 'tracer.service_url' => 'http://tracer.test']);
        $this->fakeSuccessfulTrace();

        $user     = User::factory()->create();
        $analysis = Analysis::factory()->create([
            'user_id'        => $user->id,
            'language'       => 'javascript',
            'entry_function' => 'sum',
            'runtime_input'  => [[2, 4, 6]],
        ]);

        Sanctum::actingAs($user);

        $response = $this->postJson("/api/analyses/{$analysis->id}/runtime-trace");

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.analysis.trace_mode', 'executed')
            ->assertJsonPath('data.analysis.trace_result.returnedValue', 12)
            ->assertJsonPath('data.analysis.trace_summary.totalSteps', 2);

        $this->assertCount(2, $response->json('data.analysis.trace_steps'));

        $this->assertDatabaseHas('analyses', [
            'id'         => $analysis->id,
            'trace_mode' => 'executed',
        ]);
    }

    // ---------------------------------------------------------------------------
    // B) user_cannot_run_trace_for_other_users_analysis
    // ---------------------------------------------------------------------------

    public function test_user_cannot_run_trace_for_other_users_analysis(): void
    {
        $owner       = User::factory()->create();
        $anotherUser = User::factory()->create();

        $analysis = Analysis::factory()->create(['user_id' => $owner->id]);

        Sanctum::actingAs($anotherUser);

        $response = $this->postJson("/api/analyses/{$analysis->id}/runtime-trace");

        $response->assertStatus(403);
    }

    // ---------------------------------------------------------------------------
    // C) runtime_trace_uses_request_entry_and_input_when_provided
    // ---------------------------------------------------------------------------

    public function test_runtime_trace_uses_request_entry_and_input_when_provided(): void
    {
        config(['tracer.enabled' => true, 'tracer.service_url' => 'http://tracer.test']);
        $this->fakeSuccessfulTrace();

        $user = User::factory()->create();

        // Analysis has null entry_function / runtime_input
        $analysis = Analysis::factory()->create([
            'user_id'        => $user->id,
            'language'       => 'javascript',
            'entry_function' => null,
            'runtime_input'  => null,
        ]);

        Sanctum::actingAs($user);

        $response = $this->postJson("/api/analyses/{$analysis->id}/runtime-trace", [
            'entryFunction' => 'sum',
            'input'         => [[2, 4, 6]],
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.analysis.trace_mode', 'executed');

        // Tracer should have been called with request values
        Http::assertSent(function ($request) {
            return $request->url() === 'http://tracer.test/trace'
                && $request['entryFunction'] === 'sum'
                && $request['input'] === [[2, 4, 6]];
        });

        // Effective entry_function should be persisted
        $this->assertDatabaseHas('analyses', [
            'id'             => $analysis->id,
            'entry_function' => 'sum',
        ]);
    }

    // ---------------------------------------------------------------------------
    // D) runtime_disabled_returns_safe_status
    // ---------------------------------------------------------------------------

    public function test_runtime_disabled_returns_safe_status(): void
    {
        config(['tracer.enabled' => false]);

        $user     = User::factory()->create();
        $analysis = Analysis::factory()->create([
            'user_id'        => $user->id,
            'language'       => 'javascript',
            'entry_function' => 'sum',
            'runtime_input'  => [[1, 2, 3]],
        ]);

        Sanctum::actingAs($user);

        $response = $this->postJson("/api/analyses/{$analysis->id}/runtime-trace");

        $response->assertStatus(200)
            ->assertJsonPath('data.analysis.trace_mode', 'planned')
            ->assertJsonPath('data.analysis.trace_error.code', 'TRACER_DISABLED');

        Http::assertNothingSent();
    }

    // ---------------------------------------------------------------------------
    // E) tracer_error_is_sanitized
    // ---------------------------------------------------------------------------

    public function test_tracer_error_is_sanitized(): void
    {
        config(['tracer.enabled' => true, 'tracer.service_url' => 'http://tracer.test']);

        // Tracer throws a connection exception
        Http::fake([
            'http://tracer.test/trace' => function () {
                throw new \Illuminate\Http\Client\ConnectionException('Connection refused on port 4100');
            },
        ]);

        $user     = User::factory()->create();
        $analysis = Analysis::factory()->create([
            'user_id'        => $user->id,
            'language'       => 'javascript',
            'entry_function' => 'sum',
        ]);

        Sanctum::actingAs($user);

        $response = $this->postJson("/api/analyses/{$analysis->id}/runtime-trace");

        // Should succeed (200) with a safe error mode
        $response->assertStatus(200)
            ->assertJsonPath('data.analysis.trace_mode', 'error')
            ->assertJsonPath('data.analysis.trace_error.code', 'TRACER_UNAVAILABLE');

        // Raw connection details must not appear in the response
        $this->assertStringNotContainsString('4100', $response->getContent());
        $this->assertStringNotContainsString('Connection refused', $response->getContent());
    }

    // ---------------------------------------------------------------------------
    // F) python_runtime_disabled_returns_safe_status
    // ---------------------------------------------------------------------------

    public function test_python_runtime_disabled_returns_safe_status(): void
    {
        config(['tracer.enabled' => true, 'tracer.python_enabled' => false]);

        $user     = User::factory()->create();
        $analysis = Analysis::factory()->create([
            'user_id'  => $user->id,
            'language' => 'python',
        ]);

        Sanctum::actingAs($user);

        $response = $this->postJson("/api/analyses/{$analysis->id}/runtime-trace");

        $response->assertStatus(200)
            ->assertJsonPath('data.analysis.trace_mode', 'planned')
            ->assertJsonPath('data.analysis.trace_error.code', 'PYTHON_RUNTIME_TRACE_DISABLED');

        Http::assertNothingSent();
    }

    // ---------------------------------------------------------------------------
    // G) unauthenticated_user_cannot_run_trace
    // ---------------------------------------------------------------------------

    public function test_unauthenticated_user_cannot_run_trace(): void
    {
        $analysis = Analysis::factory()->create();

        $response = $this->postJson("/api/analyses/{$analysis->id}/runtime-trace");

        $response->assertStatus(401);
    }
}
