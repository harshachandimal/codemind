# Java Runtime Tracing Architecture

## 1. Goal

* Add safe Java runtime tracing to CodeMind.
* Keep JavaScript and Python runtime tracing unchanged.
* Java tracing will use parser + manual interpreter.
* No Java compilation.
* No JVM execution.

## 2. Non-Goals

* No full Java language support.
* No packages/imports in MVP.
* No object instantiation in MVP.
* No instance methods in MVP.
* No inheritance.
* No interfaces.
* No generics.
* No annotations.
* No exceptions.
* No streams.
* No collections framework.
* No file/network/system APIs.
* No reflection.
* No multithreading.
* No running javac/java.
* No Java runtime tracing for arbitrary code.

## 3. Safety Rules

* Do not execute submitted Java code.
* Do not call javac/java/jshell.
* Do not use child_process.
* Do not compile source code.
* Do not load classes.
* Do not allow imports in MVP.
* Do not allow System APIs.
* Do not allow file/network APIs.
* Do not allow reflection.
* Enforce maxSteps.
* Enforce maxLoopIterations.
* Enforce maxCallDepth.
* Enforce maxLoopDepth.
* Enforce maxInputSize and maxSourceLength.
* Sanitize runtime values before recording.
* Never include raw sourceCode in error responses.

## 4. Java MVP Syntax

### Currently Supported (MVP 6)
- Empty class wrapper wrapper (`public class Main { ... }`)
- Static method declarations (e.g. `public static int add(int a, int b)`)
- Multiple parameters (`int`, `double`, `boolean`, `String`, arrays `int[]`, `int[][]`, etc)
- Input mapping from JSON-like arrays to Java method arguments
- Numeric literals, booleans, strings
- Variable declarations and assignments (`int x = 5;`, `x = x + 1;`)
- Arithmetic operations (`+`, `-`, `*`, `/`, `%`)
- Relational and equality operators (`<`, `<=`, `>`, `>=`, `==`, `!=`)
- Logical operators (`&&`, `||`, `!`)
- `if`, `else if`, `else` conditionals
- `while` loops
- Classic `for` loops (e.g., `for (int i = 0; i < n; i++)`)
- Loop interruption guards (`JAVA_MAX_LOOP_ITERATIONS_EXCEEDED`, `JAVA_MAX_LOOP_DEPTH_EXCEEDED`)
- Arrays (`int[]`, `double[]`, `boolean[]`, `String[]`), multi-dimensional arrays (`int[][]`)
- Array indexing (`arr[i]`), chained indexing (`matrix[i][j]`)
- Array length (`arr.length`)
- Array initializers (`int[] arr = {1, 2, 3};`)
- Simple self-recursion (`factorial(n - 1)`) with `JAVA_MAX_CALL_DEPTH_EXCEEDED` guard
- Trace steps for variable declarations, assignments, loop starts/iterations, condition evaluations, returns, function calls, array reads, and recursive calls

### Pending implementation
- Nested classes
- Object creation (`new` keyword)
- Standard library calls (`System.out.println`)
- Full JVM semantics
- Array mutation (`arr[i] = 5;`)
- `new int[10]` array instantiation
- `break` and `continue` inside loops
- Exception handling (`try/catch/finally`, `throw`)
- Backend Express /trace integrations
* object creation/new
* instance methods
* constructors
* fields/global state
* static fields
* arrays in first interpreter MVP
* method overloading
* helper methods
* mutual recursion
* classes beyond simple Main wrapper
* generics
* collections
* streams
* exceptions
* switch
* enhanced for loop
* do-while
* lambdas
* annotations
* comments do not matter but should not break parsing

## 5. Parser Options

Option A: Use a TypeScript/JavaScript Java parser package.
Pros:
* stays inside Node tracer
* no Java execution
* easier TypeScript integration
Cons:
* package quality must be checked
* AST shape may be complex

Option B: Use tree-sitter Java grammar.
Pros:
* mature parser ecosystem
* multi-language consistency
Cons:
* dependency/build complexity
* concrete syntax tree requires more mapping

Option C: Build a very small restricted Java parser.
Pros:
* full control
* no heavy dependency
* enough for MVP subset
Cons:
* more manual parsing work
* Java syntax edge cases are easy to miss

Recommendation: Start with a parser spike in the next step. Do not use javac/java for parsing.

## 6. Proposed Folder Structure

Future structure:
```text
src/java/
javaAstParser.ts
javaUnsupportedNodeGuard.ts
JavaInterpreter.ts
javaRuntimeValue.ts
javaExpressionTokenizer.ts
javaExpressionEvaluator.ts
javaMethodParser.ts
javaStatementParser.ts
javaErrors.ts
javaTruthiness.ts
javaLoopGuards.ts
javaCallDepthGuard.ts

src/java/tests/
javaAstParser.test.ts
javaUnsupportedNodeGuard.test.ts
JavaInterpreter.test.ts
javaExpressionEvaluator.test.ts
javaStatementParser.test.ts
```

## 7. Request/Response Behavior

Current /trace request shape remains same:
```json
{
  "language": "java",
  "sourceCode": "...",
  "entryFunction": "add",
  "input": [2, 3]
}
```

Future behavior:
* if Java runtime disabled:
  mode: "planned"
  message: "Java runtime tracing is not enabled yet."
* if Java runtime enabled:
  mode: "executed"
  trace.steps populated
  result.returnedValue available

Feature flag:
`JAVA_TRACER_ENABLED=false` by default

Runtime requires both:
`TRACER_EXECUTION_ENABLED=true`
`JAVA_TRACER_ENABLED=true`

Important: Even if enabled, still manual TypeScript interpreter only.

## 8. Trace Step Mapping

Map Java operations to existing trace concepts:
* function_call or method_call
* variable_declaration
* assignment
* condition_evaluation
* loop_start
* loop_iteration
* loop_exit
* array_read later
* return
* recursion_call later
* recursion_unwind later
* error

Frontend should reuse existing runtime trace UI.

## 9. Runtime State Model

Reuse current interpreter concepts:
* InterpreterState
* StepRecorder
* callStack
* variables
* maxSteps
* maxLoopIterations
* maxCallDepth
* maxLoopDepth
* sanitized snapshots

Java-specific values:
* int/number
* double/number
* boolean
* string
* null later
* arrays later

## 10. Built-in/API Policy

Allowed:
* no Java standard library calls in MVP

Rejected:
* System.out.println
* System.exit
* Runtime.getRuntime
* ProcessBuilder
* Thread
* File
* Files
* Socket
* Scanner
* Reflection APIs
* any method call not explicitly supported

Important:
* print/log calls should not run.
* no side effects.

## 11. Error Codes

Define future error codes:
* JAVA_RUNTIME_DISABLED
* JAVA_PARSE_ERROR
* JAVA_UNSUPPORTED_SYNTAX
* JAVA_ENTRY_METHOD_NOT_FOUND
* JAVA_MAX_STEPS_EXCEEDED
* JAVA_MAX_LOOP_ITERATIONS_EXCEEDED
* JAVA_MAX_CALL_DEPTH_EXCEEDED
* JAVA_MAX_LOOP_DEPTH_EXCEEDED
* JAVA_RUNTIME_TYPE_ERROR
* JAVA_UNSUPPORTED_METHOD_CALL
* JAVA_UNSUPPORTED_API

## 12. Test Strategy

List test categories:
* parser tests
* unsupported syntax tests
* expression evaluator tests
* method parser tests
* statement parser tests
* interpreter tests
* loop tests
* recursion tests
* API flag tests
* no sourceCode leak tests
* no Java subprocess tests

MVP test examples:
* add(a, b)
* maxOfTwo(a, b)
* sumRange(n)
* countPairs(n)
* factorial(n) later
* arraySum(arr) later

## 13. Rollout Plan

Phase 19.1:
* architecture document only

Phase 19.2:
* evaluate parser package and add Java parser spike

Phase 19.3:
* add Java unsupported syntax guard

Phase 19.4:
* add Java interpreter MVP:
  * static method
  * params
  * literals
  * variables
  * return
  * arithmetic

Phase 19.5:
* add if/else

Phase 19.6:
* add for/while loops

Phase 19.7:
* add arrays and indexing

Phase 19.8:
* add simple self-recursion

Phase 19.9 (Done):
* integrate /trace Java execution behind JAVA_TRACER_ENABLED

Phase 19.10:
* connect Laravel/frontend safely

Phase 19.11:
* test and commit Java runtime tracing

## Parser Spike Result

* Step 19.2 adds restricted TypeScript structural parser/scanner.
* It detects class names, static method names, braces, parentheses, and basic structures.
* It does not execute Java.
* It does not compile Java.
* It is not integrated into /trace yet.
* Unsupported syntax guard will be added next.

## Unsupported Syntax Guard

* Guard rejects unsupported Java features before interpretation.
* Guard is conservative by design.
* Static analysis may support broader Java patterns.
* Runtime MVP only supports a safe subset.
* Java is still not connected to /trace.

## Java Interpreter MVP Progress

* static methods/literals/variables/return supported in isolated tests
* arithmetic/comparisons/boolean logic supported
* if/else/else-if branches supported
* while loops/classic for loops/nested loops supported
* loop safety limits enforced
* arrays and indexing supported
* simple self-recursion supported
* integrated into /trace behind JAVA_TRACER_ENABLED flag
* no Java execution
