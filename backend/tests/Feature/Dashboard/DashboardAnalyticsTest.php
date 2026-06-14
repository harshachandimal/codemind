<?php

namespace Tests\Feature\Dashboard;

use App\Enums\AnalysisStatus;
use App\Models\Analysis;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class DashboardAnalyticsTest extends TestCase
{
    use RefreshDatabase;

    // ──────────────────────────────────────────────────────────────────────
    // A) authenticated_user_can_view_dashboard_analytics
    // ──────────────────────────────────────────────────────────────────────

    public function test_authenticated_user_can_view_dashboard_analytics(): void
    {
        $user = User::factory()->create();

        // javascript O(n) — loop pattern
        Analysis::factory()->create([
            'user_id'           => $user->id,
            'language'          => 'javascript',
            'time_complexity'   => 'O(n)',
            'space_complexity'  => 'O(1)',
            'status'            => AnalysisStatus::Completed,
            'detected_patterns' => ['loop'],
            'trace_mode'        => 'executed',
        ]);

        // javascript O(n²) — nested_loop pattern
        Analysis::factory()->create([
            'user_id'           => $user->id,
            'language'          => 'javascript',
            'time_complexity'   => 'O(n²)',
            'space_complexity'  => 'O(n)',
            'status'            => AnalysisStatus::Completed,
            'detected_patterns' => ['nested_loop'],
            'trace_mode'        => 'planned',
        ]);

        // python O(1) — recursion pattern
        Analysis::factory()->create([
            'user_id'           => $user->id,
            'language'          => 'python',
            'time_complexity'   => 'O(1)',
            'space_complexity'  => 'O(1)',
            'status'            => AnalysisStatus::Completed,
            'detected_patterns' => ['recursion'],
            'trace_mode'        => 'executed',
        ]);

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/dashboard/analytics');

        $response->assertStatus(200)
            ->assertJson([
                'success' => true,
                'message' => 'Dashboard analytics loaded successfully.',
            ]);

        $data = $response->json('data');

        // summary
        $this->assertArrayHasKey('summary', $data);
        $this->assertEquals(3, $data['summary']['total_analyses']);

        // language_breakdown present and non-empty
        $this->assertArrayHasKey('language_breakdown', $data);
        $this->assertNotEmpty($data['language_breakdown']);

        // time_complexity_breakdown present
        $this->assertArrayHasKey('time_complexity_breakdown', $data);
        $this->assertNotEmpty($data['time_complexity_breakdown']);

        // detected_pattern_breakdown present
        $this->assertArrayHasKey('detected_pattern_breakdown', $data);
        $this->assertNotEmpty($data['detected_pattern_breakdown']);

        // trace_mode_breakdown present
        $this->assertArrayHasKey('trace_mode_breakdown', $data);
        $this->assertNotEmpty($data['trace_mode_breakdown']);

        // latest_analyses present and each has expected fields
        $this->assertArrayHasKey('latest_analyses', $data);
        $this->assertNotEmpty($data['latest_analyses']);

        foreach ($data['latest_analyses'] as $item) {
            $this->assertArrayHasKey('id', $item);
            $this->assertArrayHasKey('title', $item);
            $this->assertArrayHasKey('language', $item);
            $this->assertArrayHasKey('status', $item);
            $this->assertArrayHasKey('time_complexity', $item);
            $this->assertArrayHasKey('created_at', $item);
        }
    }

    // ──────────────────────────────────────────────────────────────────────
    // B) analytics_are_scoped_to_authenticated_user
    // ──────────────────────────────────────────────────────────────────────

    public function test_analytics_are_scoped_to_authenticated_user(): void
    {
        $userA = User::factory()->create();
        $userB = User::factory()->create();

        // 2 analyses for user A
        Analysis::factory()->count(2)->create([
            'user_id'  => $userA->id,
            'language' => 'javascript',
            'status'   => AnalysisStatus::Completed,
        ]);

        // 5 analyses for user B
        Analysis::factory()->count(5)->create([
            'user_id'  => $userB->id,
            'language' => 'python',
            'status'   => AnalysisStatus::Completed,
        ]);

        Sanctum::actingAs($userA);

        $response = $this->getJson('/api/dashboard/analytics');
        $response->assertStatus(200);

        $data = $response->json('data');

        // Only user A's 2 analyses should be counted
        $this->assertEquals(2, $data['summary']['total_analyses']);

        // Language breakdown should only include javascript (user A's language)
        $labels = array_column($data['language_breakdown'], 'label');
        $this->assertContains('javascript', $labels);
        $this->assertNotContains('python', $labels);
    }

    // ──────────────────────────────────────────────────────────────────────
    // C) analytics_do_not_expose_source_code
    // ──────────────────────────────────────────────────────────────────────

    public function test_analytics_do_not_expose_source_code(): void
    {
        $user = User::factory()->create();

        Analysis::factory()->create([
            'user_id'     => $user->id,
            'source_code' => 'function secret() { return 42; }',
            'status'      => AnalysisStatus::Completed,
        ]);

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/dashboard/analytics');
        $response->assertStatus(200);

        // Assert the string 'source_code' does not appear as a key in the response JSON
        $responseContent = $response->getContent();
        $this->assertStringNotContainsString('"source_code"', $responseContent);

        // Assert the actual source code value is not in the response
        $this->assertStringNotContainsString('function secret()', $responseContent);

        // Assert latest_analyses does not contain source_code key
        $latestAnalyses = $response->json('data.latest_analyses');
        foreach ($latestAnalyses as $item) {
            $this->assertArrayNotHasKey('source_code', $item);
        }
    }

    // ──────────────────────────────────────────────────────────────────────
    // D) unauthenticated_user_cannot_view_dashboard_analytics
    // ──────────────────────────────────────────────────────────────────────

    public function test_unauthenticated_user_cannot_view_dashboard_analytics(): void
    {
        $response = $this->getJson('/api/dashboard/analytics');
        $response->assertStatus(401);
    }

    // ──────────────────────────────────────────────────────────────────────
    // E) empty_dashboard_returns_zero_counts
    // ──────────────────────────────────────────────────────────────────────

    public function test_empty_dashboard_returns_zero_counts(): void
    {
        $user = User::factory()->create();

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/dashboard/analytics');
        $response->assertStatus(200);

        $data = $response->json('data');

        $this->assertEquals(0, $data['summary']['total_analyses']);
        $this->assertEquals(0, $data['summary']['completed_analyses']);
        $this->assertEquals(0, $data['summary']['failed_analyses']);
        $this->assertEquals(0, $data['summary']['pending_analyses']);

        $this->assertEmpty($data['language_breakdown']);
        $this->assertEmpty($data['time_complexity_breakdown']);
        $this->assertEmpty($data['space_complexity_breakdown']);
        $this->assertEmpty($data['detected_pattern_breakdown']);
        $this->assertEmpty($data['trace_mode_breakdown']);

        $this->assertEmpty($data['latest_analyses']);

        $this->assertEquals(0, $data['recent_activity']['last_7_days']);
        $this->assertEquals(0, $data['recent_activity']['last_30_days']);
    }
}
