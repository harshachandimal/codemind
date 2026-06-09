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

Accepts a `TraceRequest` JSON body and returns a `TraceResult` JSON response.

> **Important:** At this stage, `/trace` validates the request and returns a safe placeholder response. It does **not** execute code.

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

**Response (`TraceResult`):** Always HTTP 200 with a typed JSON payload. Errors are encoded in `success: false` and `steps`, never as HTTP 4xx/5xx status codes.

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
| 8.10  | Sandboxed execution implementation        | 🔲 Future    |
| 8.11  | Laravel → Tracer HTTP integration         | 🔲 Future    |

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
