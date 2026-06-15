<?php

namespace App\Support;

class LanguageCapabilities
{
    public static function getAll(): array
    {
        $tracerEnabled = filter_var(env('TRACER_ENABLED', false), FILTER_VALIDATE_BOOLEAN);
        $pythonTracerEnabled = filter_var(env('TRACER_PYTHON_ENABLED', false), FILTER_VALIDATE_BOOLEAN);
        $javaTracerEnabled = filter_var(env('TRACER_JAVA_ENABLED', false), FILTER_VALIDATE_BOOLEAN);

        return [
            [
                'language' => 'javascript',
                'displayName' => 'JavaScript',
                'staticAnalysisSupported' => true,
                'runtimeTraceSupported' => true,
                'runtimeTraceEnabled' => $tracerEnabled,
                'status' => 'stable',
                'experimental' => false,
                'supportedFeatures' => [
                    'variables',
                    'arithmetic',
                    'if/else',
                    'for loops',
                    'while loops',
                    'nested loops',
                    'arrays',
                    'indexing',
                    'recursion',
                    'function calls supported by current JS interpreter subset'
                ],
                'unsupportedFeatures' => [
                    'DOM APIs',
                    'browser APIs',
                    'Node APIs',
                    'async/await',
                    'promises',
                    'classes',
                    'imports',
                    'external libraries'
                ],
                'exampleEntryFunctionRequired' => false,
                'notes' => []
            ],
            [
                'language' => 'python',
                'displayName' => 'Python',
                'staticAnalysisSupported' => true,
                'runtimeTraceSupported' => true,
                'runtimeTraceEnabled' => $tracerEnabled && $pythonTracerEnabled,
                'status' => 'experimental',
                'experimental' => true,
                'supportedFeatures' => [
                    'functions',
                    'variables',
                    'arithmetic',
                    'if/elif/else',
                    'for range loops',
                    'while loops',
                    'nested loops',
                    'lists',
                    'indexing',
                    'len()',
                    'self-recursion'
                ],
                'unsupportedFeatures' => [
                    'imports',
                    'file I/O',
                    'network I/O',
                    'classes',
                    'decorators',
                    'comprehensions',
                    'generators',
                    'async',
                    'arbitrary method calls',
                    'external libraries'
                ],
                'exampleEntryFunctionRequired' => false,
                'notes' => []
            ],
            [
                'language' => 'java',
                'displayName' => 'Java',
                'staticAnalysisSupported' => true,
                'runtimeTraceSupported' => true,
                'runtimeTraceEnabled' => $tracerEnabled && $javaTracerEnabled,
                'status' => 'experimental',
                'experimental' => true,
                'supportedFeatures' => [
                    'public class wrapper',
                    'static methods',
                    'primitive parameters',
                    'variables',
                    'arithmetic',
                    'if/else',
                    'for loops',
                    'while loops',
                    'nested loops',
                    'arrays',
                    'arr.length',
                    'indexing',
                    'self-recursion'
                ],
                'unsupportedFeatures' => [
                    'imports',
                    'packages',
                    'object creation',
                    'instance methods',
                    'classes beyond wrapper',
                    'inheritance',
                    'interfaces',
                    'enums',
                    'records',
                    'collections',
                    'streams',
                    'lambdas',
                    'System.out',
                    'file/network APIs',
                    'exceptions',
                    'helper method calls',
                    'mutual recursion'
                ],
                'exampleEntryFunctionRequired' => true,
                'notes' => []
            ]
        ];
    }
}
