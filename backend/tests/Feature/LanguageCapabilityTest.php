<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Tests\TestCase;

class LanguageCapabilityTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    public function test_capabilities_endpoint_returns_all_languages()
    {
        $response = $this->actingAs($this->user)
            ->getJson('/api/languages/capabilities');

        $response->assertStatus(200);
        
        $data = $response->json('data');
        $languages = collect($data)->pluck('language')->toArray();

        $this->assertContains('javascript', $languages);
        $this->assertContains('python', $languages);
        $this->assertContains('java', $languages);
    }

    public function test_capabilities_include_static_analysis_support()
    {
        $response = $this->actingAs($this->user)
            ->getJson('/api/languages/capabilities');

        $response->assertStatus(200);
        
        $data = $response->json('data');
        
        foreach ($data as $langCap) {
            $this->assertTrue($langCap['staticAnalysisSupported']);
        }
    }

    public function test_capabilities_respect_python_runtime_flag()
    {
        $_SERVER['TRACER_ENABLED'] = false;
        $_ENV['TRACER_ENABLED'] = false;
        $_SERVER['TRACER_PYTHON_ENABLED'] = false;
        $_ENV['TRACER_PYTHON_ENABLED'] = false;
        putenv('TRACER_ENABLED=true');
        putenv('TRACER_PYTHON_ENABLED=false');

        $response = $this->actingAs($this->user)
            ->getJson('/api/languages/capabilities');
        $pythonData = collect($response->json('data'))->firstWhere('language', 'python');
        $this->assertFalse($pythonData['runtimeTraceEnabled']);

        $_SERVER['TRACER_ENABLED'] = true;
        $_ENV['TRACER_ENABLED'] = true;
        $_SERVER['TRACER_PYTHON_ENABLED'] = true;
        $_ENV['TRACER_PYTHON_ENABLED'] = true;
        putenv('TRACER_ENABLED=true');
        putenv('TRACER_PYTHON_ENABLED=true');

        $response2 = $this->actingAs($this->user)
            ->getJson('/api/languages/capabilities');
        $pythonData2 = collect($response2->json('data'))->firstWhere('language', 'python');
        $this->assertTrue($pythonData2['runtimeTraceEnabled']);
    }

    public function test_capabilities_respect_java_runtime_flag()
    {
        $_SERVER['TRACER_ENABLED'] = false;
        $_ENV['TRACER_ENABLED'] = false;
        $_SERVER['TRACER_JAVA_ENABLED'] = false;
        $_ENV['TRACER_JAVA_ENABLED'] = false;
        putenv('TRACER_ENABLED=true');
        putenv('TRACER_JAVA_ENABLED=false');

        $response = $this->actingAs($this->user)
            ->getJson('/api/languages/capabilities');
        $javaData = collect($response->json('data'))->firstWhere('language', 'java');
        $this->assertFalse($javaData['runtimeTraceEnabled']);

        $_SERVER['TRACER_ENABLED'] = true;
        $_ENV['TRACER_ENABLED'] = true;
        $_SERVER['TRACER_JAVA_ENABLED'] = true;
        $_ENV['TRACER_JAVA_ENABLED'] = true;
        putenv('TRACER_ENABLED=true');
        putenv('TRACER_JAVA_ENABLED=true');

        $response2 = $this->actingAs($this->user)
            ->getJson('/api/languages/capabilities');
        $javaData2 = collect($response2->json('data'))->firstWhere('language', 'java');
        $this->assertTrue($javaData2['runtimeTraceEnabled']);
    }

    public function test_capabilities_do_not_expose_secrets()
    {
        $response = $this->actingAs($this->user)
            ->getJson('/api/languages/capabilities');
        
        $content = $response->getContent();
        
        // No tracer URL, no tokens
        $this->assertStringNotContainsString('http://', $content);
        $this->assertStringNotContainsString('token', strtolower($content));
    }
}
