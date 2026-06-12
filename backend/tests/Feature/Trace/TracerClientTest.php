<?php

namespace Tests\Feature\Trace;

use App\DTOs\Trace\TraceRequestData;
use App\DTOs\Trace\TraceResponseData;
use App\Services\Trace\TracerClient;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class TracerClientTest extends TestCase
{
    public function test_disabled_client_returns_safe_disabled_health()
    {
        config(['tracer.enabled' => false]);
        
        $client = app(TracerClient::class);
        $health = $client->health();
        
        $this->assertFalse($health['success']);
        $this->assertFalse($health['enabled']);
        $this->assertEquals('Tracer integration is disabled.', $health['message']);
    }

    public function test_disabled_client_returns_planned_trace_response()
    {
        config(['tracer.enabled' => false]);
        
        $client = app(TracerClient::class);
        
        $request = new TraceRequestData(
            language: 'python',
            sourceCode: 'print("hello")',
            entryFunction: null,
            input: []
        );
        
        $response = $client->trace($request);
        
        $this->assertInstanceOf(TraceResponseData::class, $response);
        $this->assertFalse($response->success);
        $this->assertEquals('planned', $response->mode);
        $this->assertEquals('Tracer integration is disabled in Laravel.', $response->message);
        $this->assertNull($response->result);
        
        Http::assertNothingSent();
    }

    public function test_enabled_client_calls_health_endpoint()
    {
        config(['tracer.enabled' => true]);
        config(['tracer.service_url' => 'http://tracer.test']);
        
        Http::fake([
            'http://tracer.test/health' => Http::response([
                'status' => 'ok',
                'version' => '1.0.0',
            ], 200)
        ]);
        
        $client = app(TracerClient::class);
        $health = $client->health();
        
        Http::assertSent(function ($request) {
            return $request->url() == 'http://tracer.test/health' &&
                   $request->method() == 'GET';
        });
    }

    public function test_enabled_client_calls_trace_endpoint()
    {
        config(['tracer.enabled' => true]);
        config(['tracer.service_url' => 'http://tracer.test']);
        
        Http::fake([
            'http://tracer.test/trace' => Http::response([
                'success' => true,
                'executionEnabled' => true,
                'mode' => 'executed',
                'message' => 'Execution complete.',
                'trace' => ['steps' => []],
                'result' => ['output' => 'hello'],
                'plan' => null,
                'error' => null,
                'metadata' => []
            ], 200)
        ]);
        
        $client = app(TracerClient::class);
        
        $request = new TraceRequestData(
            language: 'python',
            sourceCode: 'print("hello")',
            entryFunction: null,
            input: []
        );
        
        $response = $client->trace($request);
        
        Http::assertSent(function ($request) {
            return $request->url() == 'http://tracer.test/trace' &&
                   $request->method() == 'POST' &&
                   $request['language'] == 'python' &&
                   $request['sourceCode'] == 'print("hello")';
        });
        
        $this->assertTrue($response->success);
        $this->assertEquals('executed', $response->mode);
        $this->assertEquals('Execution complete.', $response->message);
        $this->assertEquals(['output' => 'hello'], $response->result);
    }

    public function test_trace_handles_unavailable_tracer_safely()
    {
        config(['tracer.enabled' => true]);
        config(['tracer.service_url' => 'http://tracer.test']);
        
        Http::fake([
            'http://tracer.test/trace' => function () {
                throw new \Illuminate\Http\Client\ConnectionException("Connection failed");
            }
        ]);
        
        $client = app(TracerClient::class);
        
        $request = new TraceRequestData(
            language: 'python',
            sourceCode: 'print("hello")',
            entryFunction: null,
            input: []
        );
        
        $response = $client->trace($request);
        
        $this->assertFalse($response->success);
        $this->assertEquals('error', $response->mode);
        $this->assertEquals('TRACER_UNAVAILABLE', $response->error['code']);
    }
}
