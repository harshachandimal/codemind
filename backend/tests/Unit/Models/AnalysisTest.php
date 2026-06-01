<?php

namespace Tests\Unit\Models;

use App\Enums\AnalysisStatus;
use App\Models\Analysis;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AnalysisTest extends TestCase
{
    use RefreshDatabase;

    public function test_analysis_belongs_to_user(): void
    {
        $user = User::factory()->create();
        $analysis = Analysis::factory()->create(['user_id' => $user->id]);

        $this->assertInstanceOf(User::class, $analysis->user);
        $this->assertEquals($user->id, $analysis->user->id);
    }

    public function test_user_has_many_analyses(): void
    {
        $user = User::factory()->create();
        Analysis::factory()->count(3)->create(['user_id' => $user->id]);

        $this->assertCount(3, $user->analyses);
    }

    public function test_status_is_cast_to_analysis_status_enum(): void
    {
        $analysis = Analysis::factory()->create(['status' => AnalysisStatus::Completed]);

        $this->assertInstanceOf(AnalysisStatus::class, $analysis->status);
        $this->assertEquals(AnalysisStatus::Completed, $analysis->status);
        $this->assertEquals('completed', $analysis->status->value);
    }

    public function test_detected_patterns_is_cast_to_array(): void
    {
        $analysis = Analysis::factory()->create([
            'detected_patterns' => ["single_loop", "array_traversal"]
        ]);

        $this->assertIsArray($analysis->detected_patterns);
        $this->assertContains("single_loop", $analysis->detected_patterns);
    }

    public function test_factory_creates_completed_analysis_by_default(): void
    {
        $analysis = Analysis::factory()->create();

        $this->assertEquals(AnalysisStatus::Completed, $analysis->status);
        $this->assertEquals('O(n)', $analysis->time_complexity);
        $this->assertEquals('O(1)', $analysis->space_complexity);
        $this->assertIsArray($analysis->detected_patterns);
    }

    public function test_pending_factory_state_sets_pending_values(): void
    {
        $analysis = Analysis::factory()->pending()->create();

        $this->assertEquals(AnalysisStatus::Pending, $analysis->status);
        $this->assertNull($analysis->time_complexity);
        $this->assertNull($analysis->space_complexity);
        $this->assertNull($analysis->detected_patterns);
        $this->assertNull($analysis->explanation);
    }

    public function test_failed_factory_state_sets_failed_status(): void
    {
        $analysis = Analysis::factory()->failed()->create();

        $this->assertEquals(AnalysisStatus::Failed, $analysis->status);
        $this->assertNotEmpty($analysis->explanation);
    }

    public function test_recursive_factory_state_contains_recursion_patterns(): void
    {
        $analysis = Analysis::factory()->recursive()->create();

        $this->assertEquals(AnalysisStatus::Completed, $analysis->status);
        $this->assertEquals('O(n)', $analysis->time_complexity);
        $this->assertEquals('O(n)', $analysis->space_complexity);
        $this->assertContains('recursion', $analysis->detected_patterns);
        $this->assertContains('base_case', $analysis->detected_patterns);
        $this->assertContains('call_stack_growth', $analysis->detected_patterns);
    }

    public function test_nested_loop_factory_state_contains_nested_loop_pattern(): void
    {
        $analysis = Analysis::factory()->nestedLoop()->create();

        $this->assertEquals('O(n²)', $analysis->time_complexity);
        $this->assertContains('nested_loop', $analysis->detected_patterns);
    }
}
