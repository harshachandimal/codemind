<?php

namespace App\Services\Analysis;

use App\DTOs\Analysis\ComplexityAnalysisResult;
use InvalidArgumentException;

class ComplexityEstimatorService
{
    public function estimate(string $sourceCode, string $language = 'javascript'): ComplexityAnalysisResult
    {
        $language = strtolower($language);
        if (!in_array($language, ['javascript', 'python', 'java'])) {
            throw new InvalidArgumentException('Unsupported language for complexity estimation.');
        }

        $normalizedSource = $this->normalizeSource($sourceCode);

        // ── Nested loop detection (depth-aware) ──────────────────────────────
        $loopDepth = $this->detectMaxLoopNestingDepth($normalizedSource, $language);

        $patterns = [];
        if ($language === 'python' && (str_contains($normalizedSource, '[') || str_contains($normalizedSource, 'list'))) {
            $patterns[] = 'list_usage';
        }
        if ($language === 'java' && (str_contains($normalizedSource, '[') || str_contains($normalizedSource, 'array'))) {
            $patterns[] = 'array_usage';
        }

        $recursionDetails = $this->analyzeRecursion($normalizedSource, $language);
        $hasRecursion = $recursionDetails !== null;

        if ($loopDepth >= 2) {
            $timeComplexity = $this->formatPolynomialComplexity($loopDepth);
            $patterns[]     = 'nested_loop';
            $patterns[]     = 'loop_depth_' . $loopDepth;

            if ($hasRecursion) {
                $patterns[] = 'recursion';
                $patterns[] = $recursionDetails['recursionType'];
            }

            $explanation    = $this->buildNestedLoopExplanation($loopDepth, $timeComplexity, $language);

            return new ComplexityAnalysisResult(
                timeComplexity: $timeComplexity,
                spaceComplexity: 'O(1)',
                detectedPatterns: $patterns,
                explanation: $explanation
            );
        }

        if ($hasRecursion) {
            $hasBaseCase      = $recursionDetails['hasBaseCase'];
            $functionName     = $recursionDetails['functionName'];
            $recursionType    = $recursionDetails['recursionType'];
            $recursiveCallCount = $recursionDetails['recursiveCallCount'];

            $patterns[] = 'recursion';
            $patterns[] = $recursionDetails['recursionType'];
            $patterns[] = 'call_stack_growth';

            if ($hasBaseCase) {
                $patterns[] = 'base_case';
            }

            if ($loopDepth === 1) {
                $patterns[] = 'single_loop';
                $patterns[] = 'loop';
            }

            $timeComplexity  = $recursionType === 'branching_recursion' ? 'O(2ⁿ)' : 'O(n)';
            $spaceComplexity = 'O(n)';

            $explanation = $this->buildRecursionExplanation(
                $functionName,
                $hasBaseCase,
                $recursionType,
                $recursiveCallCount,
                $language
            );

            return new ComplexityAnalysisResult(
                timeComplexity: $timeComplexity,
                spaceComplexity: $spaceComplexity,
                detectedPatterns: $patterns,
                explanation: $explanation
            );
        }

        if ($this->containsLogarithmicLoop($normalizedSource, $language)) {
            $patterns[] = 'logarithmic_loop';
            return new ComplexityAnalysisResult(
                timeComplexity: 'O(log n)',
                spaceComplexity: 'O(1)',
                detectedPatterns: $patterns,
                explanation: 'This code appears to contain a loop that repeatedly reduces a value by division, such as halving it each iteration. Because the input size shrinks exponentially, the estimated time complexity is O(log n). The analyzer did not detect additional data structures that grow with input size, so space is estimated as O(1).'
            );
        }

        if ($loopDepth === 1) {
            $patterns[] = 'single_loop';
            $patterns[] = 'loop';
            return new ComplexityAnalysisResult(
                timeComplexity: 'O(n)',
                spaceComplexity: 'O(1)',
                detectedPatterns: $patterns,
                explanation: "For {$language} code, the analyzer detected a loop that can scale with the input size. Because the loop processes input elements in a linear way, the estimated time complexity is O(n)."
            );
        }

        $patterns[] = 'constant_operations';
        if (preg_match('/\bif\b|\belse\b/', $normalizedSource)) {
            $patterns[] = 'conditional';
        }

        return new ComplexityAnalysisResult(
            timeComplexity: 'O(1)',
            spaceComplexity: 'O(1)',
            detectedPatterns: $patterns,
            explanation: "For {$language} code, this does not contain loops or recursive calls detected by the current analyzer, so it is estimated as constant time and constant space."
        );
    }

    private function detectMaxLoopNestingDepth(string $sourceCode, string $language): int
    {
        if ($language === 'python') {
            return $this->detectPythonLoopDepth($sourceCode);
        }

        $cleanSource = $this->removeStringsAndComments($sourceCode);
        preg_match_all('/\b(for|while)\b|[{}]/', $cleanSource, $matches);

        $stack             = [];
        $expectingLoopBody = false;
        $maxDepth          = 0;

        foreach ($matches[0] as $token) {
            if ($token === 'for' || $token === 'while') {
                $expectingLoopBody = true;
            } elseif ($token === '{') {
                $isLoopBody        = $expectingLoopBody;
                $stack[]           = $isLoopBody;
                $expectingLoopBody = false;

                if ($isLoopBody) {
                    $currentDepth = count(array_filter($stack));
                    if ($currentDepth > $maxDepth) {
                        $maxDepth = $currentDepth;
                    }
                }
            } elseif ($token === '}') {
                if (!empty($stack)) {
                    array_pop($stack);
                }
                $expectingLoopBody = false;
            }
        }

        return $maxDepth;
    }

    private function detectPythonLoopDepth(string $sourceCode): int
    {
        $lines = explode("\n", $sourceCode);
        $loopIndentations = [];
        $maxDepth = 0;

        foreach ($lines as $line) {
            $line = preg_replace('/#.*$/', '', $line);
            if (trim($line) === '') {
                continue;
            }

            preg_match('/^(\s*)/', $line, $matches);
            $indentLength = strlen($matches[1]);

            while (!empty($loopIndentations) && end($loopIndentations) >= $indentLength) {
                array_pop($loopIndentations);
            }

            if (preg_match('/^\s*(for\b|while\b)/', $line)) {
                $loopIndentations[] = $indentLength;
                $currentDepth = count($loopIndentations);
                if ($currentDepth > $maxDepth) {
                    $maxDepth = $currentDepth;
                }
            }
        }

        return $maxDepth;
    }

    private function formatPolynomialComplexity(int $depth): string
    {
        return match ($depth) {
            1       => 'O(n)',
            2       => 'O(n²)',
            3       => 'O(n³)',
            default => 'O(n^' . $depth . ')',
        };
    }

    private function buildNestedLoopExplanation(int $depth, string $timeComplexity, string $language): string
    {
        $depthWord = match ($depth) {
            2       => 'two',
            3       => 'three',
            default => $depth,
        };

        $langDisplay = ucfirst($language);
        $explanation  = "For {$langDisplay} code, the analyzer detected a loop nested {$depthWord} levels deep. ";
        $explanation .= "For each iteration of the outer loop, an inner loop may process the input again. ";

        if ($depth === 2) {
            $explanation .= "For an input of size n, the total number of operations can grow proportionally to n × n. ";
        } elseif ($depth === 3) {
            $explanation .= "For an input of size n, the total number of operations can grow proportionally to n × n × n. ";
        } else {
            $explanation .= "For an input of size n, the total number of operations can grow proportionally to n raised to the power {$depth}. ";
        }

        $explanation .= "The estimated time complexity is therefore {$timeComplexity}.";

        return $explanation;
    }

    private function analyzeRecursion(string $sourceCode, string $language): ?array
    {
        $cleanSource = $this->removeStringsAndComments($sourceCode);
        $declarations = $this->extractFunctionDeclarations($cleanSource, $language);

        foreach ($declarations as ['name' => $functionName, 'isTraditional' => $isTraditional]) {
            $callPattern = '/\b' . preg_quote($functionName, '/') . '\s*\(/';
            preg_match_all($callPattern, $cleanSource, $matches);
            $totalOccurrences = count($matches[0]);

            $recursiveCallCount = $isTraditional
                ? $totalOccurrences - 1
                : $totalOccurrences;

            if ($recursiveCallCount >= 1) {
                $hasBaseCase   = $this->hasBaseCaseReturn($cleanSource, $language);
                $recursionType = $recursiveCallCount > 1
                    ? 'branching_recursion'
                    : 'linear_recursion';

                return [
                    'functionName'       => $functionName,
                    'hasBaseCase'        => $hasBaseCase,
                    'recursiveCallCount' => $recursiveCallCount,
                    'recursionType'      => $recursionType,
                ];
            }
        }

        return null;
    }

    private function hasBaseCaseReturn(string $cleanSource, string $language): bool
    {
        if ($language === 'python') {
            return preg_match('/\bif\b.*:[\s\n]*return\b/', $cleanSource) === 1;
        }

        if (preg_match('/\bif\s*\([^)]*\)\s*return\b/', $cleanSource)) {
            return true;
        }

        if (preg_match('/\bif\s*\([^)]*\)\s*\{[^}]*\breturn\b[^}]*\}/', $cleanSource)) {
            return true;
        }

        return false;
    }

    private function buildRecursionExplanation(
        ?string $functionName,
        bool    $hasBaseCase,
        string  $recursionType,
        int     $recursiveCallCount,
        string  $language
    ): string {
        $nameText = $functionName ? " (`{$functionName}`)" : '';
        $langDisplay = ucfirst($language);

        $explanation = "For {$langDisplay} code, the analyzer detected a recursive method call{$nameText}, so recursion is included in the detected patterns. ";

        if ($hasBaseCase) {
            $explanation .= 'A base case was detected. ';
        } else {
            $explanation .= 'The analyzer detected a recursive self-call, but no clear base case was identified. ';
        }

        if ($recursionType === 'branching_recursion') {
            $explanation .= "The function makes {$recursiveCallCount} recursive calls per invocation. ";
            $explanation .= 'The estimated time complexity is therefore O(2ⁿ). ';
        } else {
            $explanation .= 'The function makes a single recursive call per invocation. ';
            $explanation .= 'The estimated time complexity is therefore O(n). ';
        }

        $explanation .= 'Each recursive call adds a stack frame that is kept in memory until the call returns. ';
        $explanation .= 'The maximum call stack depth is proportional to n (the depth of the recursion tree), so the estimated space complexity is O(n).';

        return $explanation;
    }

    private function extractFunctionDeclarations(string $sourceCode, string $language): array
    {
        $seen         = [];
        $declarations = [];

        if ($language === 'python') {
            if (preg_match_all('/\bdef\s+([a-zA-Z_$][0-9a-zA-Z_$]*)\s*\(/', $sourceCode, $matches)) {
                foreach ($matches[1] as $name) {
                    if (!isset($seen[$name])) {
                        $seen[$name]    = true;
                        $declarations[] = ['name' => $name, 'isTraditional' => true];
                    }
                }
            }
            return $declarations;
        }

        if ($language === 'java') {
            if (preg_match_all('/(?:public\s+|private\s+|protected\s+|static\s+|final\s+)*([a-zA-Z_$][0-9a-zA-Z_$\[\]<>]+)\s+([a-zA-Z_$][0-9a-zA-Z_$]*)\s*\(/', $sourceCode, $matches)) {
                foreach ($matches[2] as $name) {
                    if (!in_array($name, ['if', 'while', 'for', 'switch', 'catch', 'return'])) {
                        if (!isset($seen[$name])) {
                            $seen[$name]    = true;
                            $declarations[] = ['name' => $name, 'isTraditional' => true];
                        }
                    }
                }
            }
            return $declarations;
        }

        if (preg_match_all('/\bfunction\s+([a-zA-Z_$][0-9a-zA-Z_$]*)\s*\(/', $sourceCode, $matches)) {
            foreach ($matches[1] as $name) {
                if (!isset($seen[$name])) {
                    $seen[$name]    = true;
                    $declarations[] = ['name' => $name, 'isTraditional' => true];
                }
            }
        }

        if (preg_match_all(
            '/\b(?:const|let|var)\s+([a-zA-Z_$][0-9a-zA-Z_$]*)\s*=\s*(?:\([^)]*\)|[a-zA-Z_$][0-9a-zA-Z_$]*)\s*=>/',
            $sourceCode,
            $matches
        )) {
            foreach ($matches[1] as $name) {
                if (!isset($seen[$name])) {
                    $seen[$name]    = true;
                    $declarations[] = ['name' => $name, 'isTraditional' => false];
                }
            }
        }

        if (preg_match_all(
            '/\b(?:const|let|var)\s+([a-zA-Z_$][0-9a-zA-Z_$]*)\s*=\s*function\s*\(/',
            $sourceCode,
            $matches
        )) {
            foreach ($matches[1] as $name) {
                if (!isset($seen[$name])) {
                    $seen[$name]    = true;
                    $declarations[] = ['name' => $name, 'isTraditional' => false];
                }
            }
        }

        return $declarations;
    }

    private function containsLogarithmicLoop(string $sourceCode, string $language): bool
    {
        if ($language !== 'javascript') {
            return false;
        }

        $cleanSource = $this->removeStringsAndComments($sourceCode);

        if ($this->detectMaxLoopNestingDepth($cleanSource, $language) === 0) {
            return false;
        }

        $patterns = [
            '/\/=\s*2/',
            '/=\s*Math\.floor\([^)]*\/\s*2\)/',
            '/=\s*[^;=]+\/\s*2/'
        ];

        foreach ($patterns as $pattern) {
            if (preg_match($pattern, $cleanSource)) {
                return true;
            }
        }

        return false;
    }

    private function removeStringsAndComments(string $sourceCode): string
    {
        $sourceCode = preg_replace('/#.*$/m', '', $sourceCode);
        $sourceCode = preg_replace('/\/\/.*$/m', '', $sourceCode);
        $sourceCode = preg_replace('/\/\*.*?\*\//s', '', $sourceCode);
        $sourceCode = preg_replace("/'(?:[^'\\\\]|\\\\.)*'/", '', $sourceCode);
        $sourceCode = preg_replace('/"(?:[^"\\\\]|\\\\.)*"/', '', $sourceCode);
        $sourceCode = preg_replace('/`(?:[^`\\\\]|\\\\.)*`/', '', $sourceCode);
        return $sourceCode;
    }

    private function normalizeSource(string $sourceCode): string
    {
        return trim(str_replace(["\r\n", "\r"], "\n", $sourceCode));
    }
}