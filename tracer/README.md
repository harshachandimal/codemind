# CodeMind Tracer Service

## Purpose

The tracer service will eventually generate real runtime execution traces for JavaScript code submitted via the CodeMind API. It is a **separate Node.js + TypeScript microservice**, completely isolated from the Laravel backend.

## Current State

**HTTP contract active. Validation layer active. Static safety preflight active. No code execution implemented.**
`TraceService.trace()` validates the request, runs static text-level safety checks, and returns a safe placeholder result. No source code is evaluated or executed.

## Architecture

```
tracer/
  src/
    server.ts              — Express HTTP server entry point
    routes/
      traceRoutes.ts       — POST /trace route handler
    services/
      TraceService.ts      — core trace orchestration + validation boundary
    validators/
      traceRequestValidator.ts — structural input validation
    security/
      javascriptPreflight.ts   — static text-level dangerous pattern checker
    errors/
      TraceValidationError.ts  — structured validation error class
      TraceSafetyError.ts      — structured safety preflight error class
    types/
      trace.ts             — type contracts for trace data
    config/
      traceLimits.ts       — centralized safety limits
      serverConfig.ts      — HTTP server settings (port, CORS)
    utils/
      createTraceErrorResult.ts — safe error result builder
  dist/                    — compiled output (gitignored)
```

## HTTP API

## JavaScript Safety Preflight

The preflight checker (`src/security/javascriptPreflight.ts`) is a **static text-level rejection layer** that runs immediately after structural validation, before any future runtime tracing logic.

**How it works:**
- Inspects `sourceCode` as a plain string using a list of regex rules.
- Does **not** execute, parse, or interpret source code.
- Collects all matching violations exhaustively (not just the first match).
- Throws `TraceSafetyError` with a list of safe, user-facing violation messages if any pattern is found.
- `TraceService` catches this and returns a structured `TraceResult` with the first violation — no stack trace, no source code echo.

**This is NOT a sandbox.** A sandbox will be implemented in a later phase. The preflight is an early filter for obviously dangerous or unsupported patterns.

**Blocked pattern categories:**

| Category | Examples |
|---|---|
| Code execution | `eval()`, `new Function()`, `Function()` |
| Module system | `require()`, `import ... from`, `import()` |
| Node.js system | `process`, `child_process`, `fs` |
| Network APIs | `fetch()`, `XMLHttpRequest`, `WebSocket` |
| Browser / DOM globals | `document`, `window`, `localStorage`, `sessionStorage`, `globalThis` |
| Async / timing | `setTimeout()`, `setInterval()` |
| Obvious infinite loops | `while(true)`, `for(;;)` |
| Prototype exploits | `constructor.constructor`, `__proto__`, `prototype[` |

---

### `GET /health`

Returns service readiness. `executionEnabled` is `false` until sandbox execution is implemented.

**Response:**
```json
{
  "success": true,
  "service": "CodeMind Tracer",
  "status": "ready",
  "executionEnabled": false
}
```

---

### `POST /trace`

Accepts a `TraceRequest` JSON body and returns a `TraceApiResponse` JSON response.

**Request body (`TraceRequest`):**
```json
{
  "language": "javascript",
  "sourceCode": "function add(a, b) { return a + b; }",
  "entryFunction": "add",
  "input": [1, 2]
}
```

**Validation rules:**
| Field | Rule |
|---|---|
| `language` | Required. Must be `"javascript"`. |
| `sourceCode` | Required string, non-empty, ≤ 20,000 characters. |
| `entryFunction` | Optional string. Must match `/^[A-Za-z_$][A-Za-z0-9_$]*$/`. |
| `input` | Optional array. Max 10 arguments. |

## Trace API Response Contract

The tracer service returns a highly structured `TraceApiResponse` to the Laravel backend. To maintain absolute safety:
- **No source code is ever included in the response.**
- **No raw stack traces or internal errors are exposed.**
- The `success` boolean strictly means the code actually executed without failure.

The response operates in three modes:

### 1. Planned Mode
When `TRACER_EXECUTION_ENABLED` is false (default), the tracer validates, parses, and generates a static observation plan, but stops before execution.
- `success`: false
- `mode`: "planned"
- `trace.steps`: []
- `trace.summary.terminatedReason`: "not_executed"
- `plan`: includes the static `TracePlan`

### 2. Executed Mode
When `TRACER_EXECUTION_ENABLED` is true and the code runs successfully through the AST interpreter.
- `success`: true
- `mode`: "executed"
- `trace.steps`: populated with recorded runtime steps
- `trace.summary.terminatedReason`: "completed" (or timeout/max_steps)
- `result.returnedValue`: contains the final returned value

### 3. Error Mode
When validation, preflight, parsing, or execution fails.
- `success`: false
- `mode`: "error"
- `error.code`: A stable error code (e.g., `VALIDATION_ERROR`, `SAFETY_ERROR`, `PARSE_ERROR`, `UNSUPPORTED_SYNTAX`, `INTERPRETER_ERROR`)
- `error.message`: Safe, human-readable error description
- `trace.steps`: []

**Response format example (`TraceApiResponse`):** Always HTTP 200 with a typed JSON payload. Errors are encoded within the JSON payload, never as HTTP 4xx/5xx status codes.


---

## Safety Rules

> These rules are **mandatory** and must never be bypassed.

1. **User code must never be executed unsandboxed.**
   Sandboxed execution via isolated worker threads or child processes is the only acceptable approach.

2. **Laravel must not execute user code.**
   The Laravel backend must delegate all code execution requests to this tracer service via HTTP, never directly.

3. **Strict resource limits must be enforced before any execution.**
   All limits are defined in `src/config/traceLimits.ts` as the single source of truth:
   - `timeoutMs` — maximum wall-clock time per trace run
   - `maxSteps` — maximum recorded trace steps
   - `maxSourceLength` — maximum source code input size
   - `maxOutputBytes` — maximum output buffer size

4. **Blocked capabilities inside the sandbox (future implementation):**
   - Filesystem access (`fs`, `path` writes)
   - Network access (`http`, `https`, `fetch`, `net`)
   - Dynamic imports and `require()` of arbitrary modules
   - `process.exit()`, `process.env`, `process.argv` access
   - Dangerous globals: `eval`, `Function`, `__dirname`, `__filename`
   - Child process spawning (`child_process`, `worker_threads` from user code)

## Development Scripts

```bash
npm run dev        # Start HTTP server with tsx (development, port 4100)
npm run build      # Compile TypeScript to dist/
npm run start      # Run compiled output (production)
npm run typecheck  # Type-check without emitting files
```

## Phase Roadmap

| Phase | Description                               | Status      |
|-------|-------------------------------------------|-------------|
| 8.1   | Architecture & safety model documentation | ✅ Complete  |
| 8.2   | Node.js + TypeScript service foundation   | ✅ Complete  |
| 8.3   | Validation layer & type contracts         | ✅ Complete  |
| 8.4   | HTTP server contract (Express)            | ✅ Complete  |
| 8.5   | Static JavaScript safety preflight        | ✅ Complete  |
| 8.6   | Tracer unit tests                         | ✅ Complete  |
| 8.7   | Safe AST parsing foundation               | ✅ Complete  |
| 8.8   | Trace plan generator                      | ✅ Complete  |
| 8.9   | Runtime execution design gate             | ✅ Complete  |
| 8.10  | Commit tracer foundation safely           | ✅ Complete  |
| 8.11  | Design safe execution MVP                 | ✅ Complete  |
| 8.12  | Add interpreter type contracts            | 🔲 Future    |
| 8.13  | Build execution env & variable store      | 🔲 Future    |
| 8.14  | Interpret functions & returns             | 🔲 Future    |
| 8.15  | Interpret variables & assignments         | 🔲 Future    |
| 8.16  | Interpret simple for loops                | 🔲 Future    |
| 8.17  | Generate real TraceStep output            | 🔲 Future    |
| 8.18  | Add interpreter tests                     | 🔲 Future    |
| 8.19  | Enable execution behind execution gate    | 🔲 Future    |
| 8.20  | Verify tracer real execution MVP          | 🔲 Future    |
| 8.21  | Commit safe execution MVP                 | 🔲 Future    |

## Safe Execution MVP Plan

The first runtime tracer implementation uses an **AST interpreter** rather than directly executing JavaScript (e.g. via `eval` or `vm`).

**Supported MVP syntax:**
- `FunctionDeclaration`, `BlockStatement`, `ReturnStatement`
- `VariableDeclaration`, `VariableDeclarator`, `Identifier`
- `NumericLiteral`, `StringLiteral`, `BooleanLiteral`, `ArrayExpression`
- Basic `BinaryExpression`: `+`, `-`, `*`, `/`, `%`, `<`, `<=`, `>`, `>=`, `===`, `!==`
- Simple `AssignmentExpression` and `UpdateExpression` (`i++`, `i--`)
- `ForStatement` (simple numeric counters), `IfStatement`, `WhileStatement` (with strict maxLoopIterations limit)
- **Nested loops**: `for` inside `for`, `while` inside `while`, mixed `for`/`while` nesting — protected by `maxLoopDepth`, `maxLoopIterations`, and `maxSteps`
- `MemberExpression` for array indexing: `arr[i]`, `arr.length`, nested reads `matrix[i][j]`, `matrix[i].length`
- `CallExpression` (calling the entry function, and self-recursion)

**Unsupported MVP syntax (fails safely):**
- imports, `require`
- async/await, Promise, fetch, DOM APIs
- classes, `this`, `new`, closures, object methods
- `try/catch`, generators, spread/rest, destructuring
- Arbitrary function calls (e.g. helper functions, mutual recursion). Only self-recursion is supported with strict `maxCallDepth` protection.
- `break`, `continue`, `for...of`, `for...in`
- Complex loop mutations (array element assignment, object mutation)
- Unbounded loop depth beyond `maxLoopDepth` (5 levels by default)

**Safety Limits:**
- Enforced: `maxSteps`, `timeoutMs`, `maxSourceLength`, `maxOutputBytes`, `maxLoopIterations`, `maxCallDepth`, `maxArrayLength`, `maxLoopDepth`
- **`maxLoopDepth` (default 5)**: Limits nesting depth of loops. Attempting 6+ levels throws `MAX_LOOP_DEPTH_EXCEEDED`.
- **`maxLoopIterations` (default 100)**: Limits iterations per individual loop. A nested `n×n` loop uses 100 outer + 100 inner iterations before hitting this limit.
- **`maxSteps` (default 500)**: Caps total recorded trace steps across all loops.
- The execution gate (`TRACER_EXECUTION_ENABLED`) remains disabled by default. No real execution is implemented yet.

## Runtime Execution Gate

Runtime code execution is **disabled by default** and controlled by an environment variable.

```
TRACER_EXECUTION_ENABLED=true npm run dev
```

> **This flag does not make execution safe by itself.**

Before enabling execution, the following must be in place:
- A fully sandboxed child process or worker thread runner.
- All `TRACE_LIMITS` enforced: timeout, max steps, max output size.
- All dangerous built-in modules (`fs`, `child_process`, `net`, `process`, etc.) blocked inside the sandbox.
- Security preflight, AST analysis, and sandbox tests all passing.

Currently, the tracer supports **validation, safety preflight, AST parsing, and trace planning only**. No source code is ever executed.
