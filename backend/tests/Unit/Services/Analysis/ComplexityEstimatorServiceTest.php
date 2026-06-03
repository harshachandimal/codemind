<?php

namespace Tests\Unit\Services\Analysis;

use App\Services\Analysis\ComplexityEstimatorService;
use InvalidArgumentException;
use Tests\TestCase;

class ComplexityEstimatorServiceTest extends TestCase
{
    private ComplexityEstimatorService $service;

    protected function setUp(): void
    {
        parent::setUp();
        $this->service = new ComplexityEstimatorService();
    }

    public function test_it_detects_constant_operations_as_o_1(): void
    {
        $source = <<<'JS'
function add(a, b) {
  return a + b;
}
JS;

        $result = $this->service->estimate($source);

        $this->assertEquals('O(1)', $result->timeComplexity);
        $this->assertEquals('O(1)', $result->spaceComplexity);
        $this->assertContains('constant_operations', $result->detectedPatterns);
    }

    public function test_it_detects_single_loop_as_o_n(): void
    {
        $source = <<<'JS'
function sumArray(numbers) {
  let total = 0;

  for (let i = 0; i < numbers.length; i++) {
    total += numbers[i];
  }

  return total;
}
JS;

        $result = $this->service->estimate($source);

        $this->assertEquals('O(n)', $result->timeComplexity);
        $this->assertEquals('O(1)', $result->spaceComplexity);
        $this->assertContains('single_loop', $result->detectedPatterns);
    }

    public function test_it_detects_nested_loop_as_o_n_squared(): void
    {
        $source = <<<'JS'
function printPairs(items) {
  for (let i = 0; i < items.length; i++) {
    for (let j = 0; j < items.length; j++) {
      console.log(items[i], items[j]);
    }
  }
}
JS;

        $result = $this->service->estimate($source);

        $this->assertEquals('O(n²)', $result->timeComplexity);
        $this->assertEquals('O(1)', $result->spaceComplexity);
        $this->assertContains('nested_loop', $result->detectedPatterns);
    }

    public function test_it_detects_logarithmic_loop_as_o_log_n(): void
    {
        $source = <<<'JS'
function shrinkNumber(n) {
  while (n > 1) {
    n = Math.floor(n / 2);
  }

  return n;
}
JS;

        $result = $this->service->estimate($source);

        $this->assertEquals('O(log n)', $result->timeComplexity);
        $this->assertEquals('O(1)', $result->spaceComplexity);
        $this->assertContains('logarithmic_loop', $result->detectedPatterns);
    }

    public function test_it_detects_shorthand_logarithmic_loop_as_o_log_n(): void
    {
        $source = <<<'JS'
function shrinkNumber(n) {
  while (n > 1) {
    n /= 2;
  }

  return n;
}
JS;

        $result = $this->service->estimate($source);

        $this->assertEquals('O(log n)', $result->timeComplexity);
        $this->assertContains('logarithmic_loop', $result->detectedPatterns);
    }

    public function test_it_detects_simple_recursion_with_base_case(): void
    {
        $source = <<<'JS'
function factorial(n) {
  if (n === 0) {
    return 1;
  }

  return n * factorial(n - 1);
}
JS;

        $result = $this->service->estimate($source);

        $this->assertEquals('O(n)', $result->timeComplexity);
        $this->assertEquals('O(n)', $result->spaceComplexity);
        $this->assertContains('recursion', $result->detectedPatterns);
        $this->assertContains('base_case', $result->detectedPatterns);
        $this->assertContains('call_stack_growth', $result->detectedPatterns);
        $this->assertStringContainsStringIgnoringCase('call stack', $result->explanation);
        $this->assertStringContainsStringIgnoringCase('returns', $result->explanation);
    }

    public function test_it_detects_recursion_without_clear_base_case(): void
    {
        $source = <<<'JS'
function repeat(n) {
  return repeat(n - 1);
}
JS;

        $result = $this->service->estimate($source);

        $this->assertEquals('O(n)', $result->timeComplexity);
        $this->assertEquals('O(n)', $result->spaceComplexity);
        $this->assertContains('recursion', $result->detectedPatterns);
        $this->assertContains('call_stack_growth', $result->detectedPatterns);
        $this->assertStringContainsStringIgnoringCase('no clear base case', $result->explanation);
    }

    public function test_it_rejects_unsupported_language(): void
    {
        $this->expectException(InvalidArgumentException::class);
        $this->expectExceptionMessage('Unsupported language');

        $this->service->estimate('print("hello")', 'python');
    }
}
