<?php

namespace Database\Factories;

use App\Enums\AnalysisStatus;
use App\Models\Analysis;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class AnalysisFactory extends Factory
{
    protected $model = Analysis::class;

    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'title' => fake()->sentence(3),
            'language' => 'javascript',
            'source_code' => "function sum(arr) {\n  let total = 0;\n  for (let i = 0; i < arr.length; i++) {\n    total += arr[i];\n  }\n  return total;\n}",
            'status' => AnalysisStatus::Completed,
            'time_complexity' => 'O(n)',
            'space_complexity' => 'O(1)',
            'detected_patterns' => ['single_loop', 'array_traversal'],
            'explanation' => 'This function iterates through the array once and keeps a constant amount of extra memory.',
            'trace_mode' => null,
            'trace_steps' => null,
            'trace_summary' => null,
            'trace_result' => null,
            'trace_plan' => null,
            'trace_error' => null,
            'trace_metadata' => null,
        ];
    }

    public function pending(): static
    {
        return $this->state(fn () => [
            'status' => AnalysisStatus::Pending,
            'time_complexity' => null,
            'space_complexity' => null,
            'detected_patterns' => null,
            'explanation' => null,
        ]);
    }

    public function failed(): static
    {
        return $this->state(fn () => [
            'status' => AnalysisStatus::Failed,
            'explanation' => 'Analysis failed because the submitted code could not be processed.',
        ]);
    }

    public function recursive(): static
    {
        return $this->state(fn () => [
            'title' => 'Recursive Factorial Function',
            'source_code' => "function factorial(n) {\n  if (n === 0) return 1;\n  return n * factorial(n - 1);\n}",
            'time_complexity' => 'O(n)',
            'space_complexity' => 'O(n)',
            'detected_patterns' => ['recursion', 'base_case', 'call_stack_growth'],
            'explanation' => 'This function calls itself until it reaches the base case, so the call stack grows linearly with n.',
        ]);
    }

    public function nestedLoop(): static
    {
        return $this->state(fn () => [
            'title' => 'Nested Loop Example',
            'source_code' => "function pairs(arr) {\n  for (let i = 0; i < arr.length; i++) {\n    for (let j = 0; j < arr.length; j++) {\n      console.log(arr[i], arr[j]);\n    }\n  }\n}",
            'time_complexity' => 'O(n²)',
            'space_complexity' => 'O(1)',
            'detected_patterns' => ['nested_loop'],
            'explanation' => 'The nested loops cause the function to process every pair of array elements.',
        ]);
    }

    public function withExecutedTrace(): static
    {
        return $this->state(fn () => [
            'trace_mode' => 'executed',
            'trace_steps' => [
                [
                    'step' => 1,
                    'line' => 1,
                    'type' => 'function_call',
                    'description' => 'Function add was called.',
                    'variables' => [],
                    'callStack' => ['add'],
                ],
                [
                    'step' => 2,
                    'line' => 2,
                    'type' => 'return',
                    'description' => 'Function add returned 5.',
                    'variables' => [],
                    'callStack' => ['add'],
                ],
            ],
            'trace_summary' => [
                'totalSteps' => 2,
                'terminatedReason' => 'completed',
            ],
            'trace_result' => [
                'returnedValue' => 5,
            ],
            'trace_plan' => null,
            'trace_error' => null,
            'trace_metadata' => [
                'language' => 'javascript',
                'entryFunction' => 'add',
            ],
        ]);
    }
}
