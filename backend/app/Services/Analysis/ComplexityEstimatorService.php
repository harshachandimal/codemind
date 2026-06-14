<?php

namespace App\Services\Analysis;

use App\DTOs\Analysis\ComplexityAnalysisResult;
use InvalidArgumentException;

class ComplexityEstimatorService
{
    public function estimate(string $sourceCode, string $language = 'javascript'): ComplexityAnalysisResult
    {
        if (strtolower($language) !== 'javascript') {
            throw new InvalidArgumentException('Unsupported language for complexity estimation.');
        }

        $normalizedSource = $this->normalizeSource($sourceCode);

        // ── Nested loop detection (depth-aware) ──────────────────────────────
        $loopDepth = $this->detectMaxLoopNestingDepth($normalizedSource);

        if ($loopDepth >= 2) {
            $timeComplexity = $this->formatPolynomialComplexity($loopDepth);
            $patterns       = ['nested_loop', 'loop_depth_' . $loopDepth];
            $explanation    = $this->buildNestedLoopExplanation($loopDepth, $timeComplexity);

            return new ComplexityAnalysisResult(
                timeComplexity: $timeComplexity,
                spaceComplexity: 'O(1)',
                detectedPatterns: $patterns,
                explanation: $explanation
            );
        }

        $recursionDetails = $this->analyzeRecursion($normalizedSource);
        if ($recursionDetails !== null) {
            $hasBaseCase      = $recursionDetails['hasBaseCase'];
            $functionName     = $recursionDetails['functionName'];
            $recursionType    = $recursionDetails['recursionType'];
            $recursiveCallCount = $recursionDetails['recursiveCallCount'];

            $patterns = ['recursion', $recursionType, 'call_stack_growth'];
            if ($hasBaseCase) {
                $patterns[] = 'base_case';
            }

            $timeComplexity  = $recursionType === 'branching_recursion' ? 'O(2ⁿ)' : 'O(n)';
            $spaceComplexity = 'O(n)';

            $explanation = $this->buildRecursionExplanation(
                $functionName,
                $hasBaseCase,
                $recursionType,
                $recursiveCallCount
            );

            return new ComplexityAnalysisResult(
                timeComplexity: $timeComplexity,
                spaceComplexity: $spaceComplexity,
                detectedPatterns: $patterns,
                explanation: $explanation
            );
        }

        if ($this->containsLogarithmicLoop($normalizedSource)) {
            return new ComplexityAnalysisResult(
                timeComplexity: 'O(log n)',
                spaceComplexity: 'O(1)',
                detectedPatterns: ['logarithmic_loop'],
                explanation: 'This code appears to contain a loop that repeatedly reduces a value by division, such as halving it each iteration. Because the input size shrinks exponentially, the estimated time complexity is O(log n). The analyzer did not detect additional data structures that grow with input size, so space is estimated as O(1).'
            );
        }

        if ($loopDepth === 1) {
            return new ComplexityAnalysisResult(
                timeComplexity: 'O(n)',
                spaceComplexity: 'O(1)',
                detectedPatterns: ['single_loop'],
                explanation: 'This code appears to contain a loop that can scale with the input size. Because the loop processes input elements in a linear way, the estimated time complexity is O(n). The analyzer did not detect additional data structures that grow with input size, so space is estimated as O(1).'
            );
        }

        return new ComplexityAnalysisResult(
            timeComplexity: 'O(1)',
            spaceComplexity: 'O(1)',
            detectedPatterns: ['constant_operations'],
            explanation: 'This code does not contain loops or recursive calls detected by the current analyzer, so it is estimated as constant time and constant space.'
        );
    }

    /**
     * Returns the maximum loop nesting depth found in the source code.
     *
     * Returns:
     *   0  — no loops detected
     *   1  — one or more sequential (non-nested) loops
     *   2  — at least one loop nested inside another loop
     *   3+ — deeper nesting levels
     *
     * Algorithm: scan tokens (loop keywords and braces), maintain a stack of
     * "is this brace the opening of a loop body?" booleans. At any point the
     * number of true values on the stack is the current loop nesting depth.
     *
     * Sequential loops count as depth 1 because when the second loop begins
     * the first loop's brace has already been popped from the stack.
     */
    private function detectMaxLoopNestingDepth(string $sourceCode): int
    {
        $cleanSource = $this->removeStringsAndComments($sourceCode);

        // Extract all loop keywords and braces as an ordered token list.
        preg_match_all('/\b(for|while)\b|[{}]/', $cleanSource, $matches);

        $stack             = [];   // each entry: bool — is this brace a loop body?
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
                    // Current nesting depth = number of true values on the stack.
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

    /**
     * Formats O(n), O(n²), O(n³) or O(n^k) for deeper nesting.
     */
    private function formatPolynomialComplexity(int $depth): string
    {
        return match ($depth) {
            1       => 'O(n)',
            2       => 'O(n²)',
            3       => 'O(n³)',
            default => 'O(n^' . $depth . ')',
        };
    }

    /**
     * Builds an educational explanation for nested loop complexity.
     */
    private function buildNestedLoopExplanation(int $depth, string $timeComplexity): string
    {
        $depthWord = match ($depth) {
            2       => 'two',
            3       => 'three',
            default => $depth,
        };

        $explanation  = "The analyzer detected loops nested {$depthWord} levels deep. ";
        $explanation .= "For each iteration of the outer loop, an inner loop may process the input again. ";

        if ($depth === 2) {
            $explanation .= "For an input of size n, the total number of operations can grow proportionally to n × n. ";
        } elseif ($depth === 3) {
            $explanation .= "For an input of size n, the total number of operations can grow proportionally to n × n × n. ";
        } else {
            $explanation .= "For an input of size n, the total number of operations can grow proportionally to n raised to the power {$depth}. ";
        }

        $explanation .= "The estimated time complexity is therefore {$timeComplexity}. ";
        $explanation .= "The analyzer did not detect additional data structures that grow with input size, so space is estimated as O(1).";

        return $explanation;
    }

    /**
     * Detects whether the source code contains a recursive function and returns
     * details about it, or null if no recursion is found.
     *
     * Returns an array with keys:
     *   - functionName       (string)
     *   - hasBaseCase        (bool)
     *   - recursiveCallCount (int)
     *   - recursionType      ('linear_recursion' | 'branching_recursion')
     */
    private function analyzeRecursion(string $sourceCode): ?array
    {
        $cleanSource = $this->removeStringsAndComments($sourceCode);
        $declarations = $this->extractFunctionDeclarations($cleanSource);

        foreach ($declarations as ['name' => $functionName, 'isTraditional' => $isTraditional]) {
            // Count occurrences of `name(` in the cleaned source.
            $callPattern = '/\b' . preg_quote($functionName, '/') . '\s*\(/';
            preg_match_all($callPattern, $cleanSource, $matches);
            $totalOccurrences = count($matches[0]);

            // For traditional `function name()` declarations the keyword header
            // already contains `name(`, so the definition site is counted once.
            // We need strictly more than 1 to confirm a recursive call.
            //
            // For arrow / expression declarations (`const name = () =>` / `const name = function()`)
            // the definition site does NOT contain `name(`, so even 1 occurrence
            // is already a recursive self-call.
            $recursiveCallCount = $isTraditional
                ? $totalOccurrences - 1
                : $totalOccurrences;

            if ($recursiveCallCount >= 1) {
                $hasBaseCase   = $this->hasBaseCaseReturn($cleanSource);
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

    /**
     * Returns true when the source contains an `if` branch that immediately
     * returns (i.e. acts as a base case).
     *
     * Matches both:
     *   if (n === 0) return 1;          (single-line)
     *   if (n === 0) { return 1; }      (block form)
     */
    private function hasBaseCaseReturn(string $cleanSource): bool
    {
        // Single-line guard: if (...) return ...;
        if (preg_match('/\bif\s*\([^)]*\)\s*return\b/', $cleanSource)) {
            return true;
        }

        // Block form: if (...) { ... return ...; ... }
        if (preg_match('/\bif\s*\([^)]*\)\s*\{[^}]*\breturn\b[^}]*\}/', $cleanSource)) {
            return true;
        }

        return false;
    }

    /**
     * Builds an educational explanation that describes whether the recursion is
     * linear or branching and explains the resulting complexity.
     */
    private function buildRecursionExplanation(
        ?string $functionName,
        bool    $hasBaseCase,
        string  $recursionType,
        int     $recursiveCallCount
    ): string {
        $nameText = $functionName ? " (`{$functionName}`)" : '';

        $explanation = "This code appears to contain a recursive function{$nameText} because the function calls itself. ";

        if ($hasBaseCase) {
            $explanation .= 'A base case was detected: the function has a conditional branch that contains a return statement, which stops the recursion when the stopping condition is met. ';
        } else {
            $explanation .= 'The analyzer detected a recursive self-call, but no clear base case (an if branch with a return) was identified by the current rule-based analyzer. ';
        }

        if ($recursionType === 'branching_recursion') {
            $explanation .= "The function makes {$recursiveCallCount} recursive calls per invocation, which means the call tree branches at every level. ";
            $explanation .= 'This branching pattern causes an exponential number of calls as the input grows: approximately 2ⁿ calls for an input of size n. ';
            $explanation .= 'The estimated time complexity is therefore O(2ⁿ). ';
        } else {
            $explanation .= 'The function makes a single recursive call per invocation, so the call chain grows linearly with the input. ';
            $explanation .= 'For an input of size n, there are up to n recursive calls before the base case is reached. ';
            $explanation .= 'The estimated time complexity is therefore O(n). ';
        }

        $explanation .= 'Each recursive call adds a stack frame that is kept in memory until the call returns. ';
        $explanation .= 'The maximum call stack depth is proportional to n (the depth of the recursion tree), so the estimated space complexity is O(n).';

        return $explanation;
    }

    /**
     * Extracts all function declarations from the cleaned source code and returns
     * a list of arrays, each with:
     *   - 'name'          (string) the function identifier
     *   - 'isTraditional' (bool)   true for `function name()`, false for arrow /
     *                              function-expression declarations
     *
     * Handles:
     *   function factorial(n) {}              → isTraditional: true
     *   const factorial = (n) => {}           → isTraditional: false
     *   let/var factorial = (n) => {}         → isTraditional: false
     *   const factorial = function(n) {}      → isTraditional: false
     *
     * Duplicates are removed before returning.
     */
    private function extractFunctionDeclarations(string $sourceCode): array
    {
        $seen         = [];
        $declarations = [];

        // Traditional function declarations: function name(...)
        // The definition header contains `name(`, so isTraditional = true.
        if (preg_match_all('/\bfunction\s+([a-zA-Z_$][0-9a-zA-Z_$]*)\s*\(/', $sourceCode, $matches)) {
            foreach ($matches[1] as $name) {
                if (!isset($seen[$name])) {
                    $seen[$name]    = true;
                    $declarations[] = ['name' => $name, 'isTraditional' => true];
                }
            }
        }

        // Arrow functions: const/let/var name = (...) => or name = param =>
        // The definition does NOT contain `name(`, so isTraditional = false.
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

        // Function expressions: const/let/var name = function(...)
        // The definition does NOT contain `name(`, so isTraditional = false.
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

    private function containsLogarithmicLoop(string $sourceCode): bool
    {
        $cleanSource = $this->removeStringsAndComments($sourceCode);

        if ($this->detectMaxLoopNestingDepth($cleanSource) === 0) {
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
        // Strip single-line comments
        $sourceCode = preg_replace('/\/\/.*$/m', '', $sourceCode);
        // Strip multi-line comments
        $sourceCode = preg_replace('/\/\*.*?\*\//s', '', $sourceCode);
        // Strip single-quoted strings (allow escaped quotes inside)
        $sourceCode = preg_replace("/'(?:[^'\\\\]|\\\\.)*'/", '', $sourceCode);
        // Strip double-quoted strings (allow escaped quotes inside)
        $sourceCode = preg_replace('/"(?:[^"\\\\]|\\\\.)*"/', '', $sourceCode);
        // Strip template literals (allow escaped backticks inside)
        $sourceCode = preg_replace('/`(?:[^`\\\\]|\\\\.)*`/', '', $sourceCode);
        return $sourceCode;
    }

    private function normalizeSource(string $sourceCode): string
    {
        return trim(str_replace(["\r\n", "\r"], "\n", $sourceCode));
    }
}
