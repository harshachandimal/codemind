# CodeMind — Architecture

---

## Overview

This document describes the current and planned architecture of CodeMind. Architecture decisions are made incrementally — we start simple and introduce complexity only when justified by real requirements.

---

## Current Architecture (MVP)

The MVP uses a straightforward three-tier architecture:

```
┌─────────────────────────────────────────────────┐
│                   User Browser                  │
│                                                 │
│   ┌─────────────────────────────────────────┐   │
│   │         React Frontend (SPA)            │   │
│   │   - Monaco code editor                  │   │
│   │   - Analysis results display            │   │
│   │   - History view                        │   │
│   └──────────────┬──────────────────────────┘   │
└──────────────────│──────────────────────────────┘
                   │  HTTPS / REST API (JSON)
                   ▼
┌──────────────────────────────────────────────────┐
│              Laravel Backend (API)               │
│                                                  │
│   - Request validation                           │
│   - Authentication (Sanctum)                     │
│   - Business logic via Service classes           │
│   - Static code analysis                         │
│   - Complexity estimation                        │
│   - Eloquent ORM                                 │
└──────────────────┬───────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────┐
│          MySQL Database (via WampServer)          │
│                                                  │
│   - users table                                  │
│   - analyses table                               │
│   - (future) jobs / results tables               │
└──────────────────────────────────────────────────┘
```

### Tech Stack — MVP

| Component | Technology | Reason |
|---|---|---|
| Frontend | React + Vite | Component-driven UI, large ecosystem |
| Code Editor | Monaco Editor | Same engine as VS Code; rich JS support |
| Backend API | Laravel 11 (PHP) | Mature, opinionated, excellent ORM/auth |
| Database | MySQL 9.x (via WampServer) | Relational, reliable, local WAMP integration |
| Auth | Laravel Sanctum | SPA-friendly token authentication |

---

## Authentication Architecture

Phase 3 uses **Laravel Sanctum** token-based API authentication.
Cookie-based SPA authentication may be considered later, but token auth is used first for clarity.

### Authentication Flow

1. React Login Form
   -> POST /api/auth/login
   -> Laravel validates credentials
   -> Laravel creates Sanctum token
   -> React stores token
   -> React sends Authorization: Bearer token
   -> Protected API route responds

### Auth Backend Structure

Controller -> Form Request -> Action -> Service -> Resource -> ApiResponse

- Controllers stay thin.
- Form Requests validate input.
- Actions coordinate use cases.
- Services hold reusable auth business logic.
- Resources format user data.
- ApiResponse wraps final JSON response.

---

## Future Architecture

As the platform grows, the architecture will evolve to handle heavier analysis workloads and more sophisticated JavaScript parsing:

```
┌─────────────────────────────────────────────────────┐
│                    User Browser                     │
│              React Frontend (SPA)                   │
└──────────────────────┬──────────────────────────────┘
                       │ REST / WebSocket
                       ▼
┌─────────────────────────────────────────────────────┐
│              Laravel Backend (API Gateway)          │
│                                                     │
│   - Auth, routing, orchestration                    │
│   - Dispatches jobs to Redis Queue                  │
│   - Returns results to frontend                     │
└────────┬───────────────────────────┬────────────────┘
         │                           │
         ▼                           ▼
┌─────────────────┐       ┌──────────────────────────┐
│    MySQL DB     │       │      Redis Queue          │
│ (or PostgreSQL/ │       │   (Laravel Horizon)       │
│  MariaDB later) │       │                           │
└─────────────────┘       └──────────┬───────────────┘
                                     │
                                     ▼
                          ┌──────────────────────────┐
                          │  Node.js Analysis Service │
                          │                          │
                          │   - Babel / Acorn AST    │
                          │   - Deep JS parsing      │
                          │   - Complexity analysis  │
                          │   - Execution tracing    │
                          └──────────────────────────┘
```

---

## Why Laravel as the Main Backend?

Laravel is chosen as the primary backend for several reasons:

1. **Mature Ecosystem** — Laravel provides built-in solutions for authentication, validation, ORM, queues, and API resource transformation. This reduces boilerplate and accelerates development.
2. **Eloquent ORM** — Clean, expressive database interaction with MySQL via Eloquent models. Future environments may use PostgreSQL or MariaDB if needed.
3. **API Resources** — Laravel API Resources provide a clean transformation layer between database models and JSON responses.
4. **Request Validation** — Form Requests provide centralized, reusable validation logic.
5. **Queue System** — Laravel's queue system (backed by Redis via Horizon) will handle async analysis jobs without coupling them to the HTTP request lifecycle.
6. **Security** — Laravel provides CSRF protection, rate limiting, and Sanctum for SPA auth out of the box.

---

## Why Node.js as a Future Analysis Microservice?

JavaScript Abstract Syntax Tree (AST) parsing is most naturally done within a JavaScript runtime. Tools like **Babel**, **Acorn**, and **@babel/traverse** are Node.js native and produce highly detailed ASTs that are difficult to replicate from PHP.

In later phases, a dedicated **Node.js microservice** will be introduced to:

- Parse JavaScript code into a full AST using Babel or Acorn
- Traverse the AST to identify loops, recursion, closures, and data structures
- Perform accurate complexity estimation based on structural patterns
- Support execution tracing for the step-by-step visualizer

This microservice will be invoked **asynchronously** by Laravel via the Redis job queue, keeping the main API responsive while heavy analysis runs in the background.

> **Note:** Until Phase 12, analysis will be handled by PHP-based pattern matching in Laravel. The Node.js service is introduced only when its precision justifies the additional operational complexity.

---

## Data Flow (MVP)

```
User pastes code
      │
      ▼
React sends POST /api/analyses
      │
      ▼
Laravel validates request
      │
      ▼
AnalysisService::analyse($code)
  ├── ComplexityEstimator::estimate($code)
  ├── ExplainerService::explain($code)
  └── Returns AnalysisResult DTO
      │
      ▼
Analysis saved to MySQL
      │
      ▼
AnalysisResource transforms result to JSON
      │
      ▼
React displays complexity + explanation
```

*Note:* In future phases, the analyzer will detect recursive call patterns and produce structured recursion metadata.

Example future metadata:
```json
{
  "type": "recursion",
  "function": "factorial",
  "baseCase": "n === 0",
  "recursiveCall": "factorial(n - 1)",
  "estimatedDepth": "n",
  "stackSpace": "O(n)"
}
```

---

## Security Considerations

- **No code execution:** User-submitted JavaScript is **never executed** on the server. Analysis is purely static (text + pattern matching).
- **Input validation:** All code submissions are validated for size limits and content type before processing.
- **Rate limiting:** API endpoints are rate-limited to prevent abuse.
- **Authentication:** All analysis endpoints (except possibly a public demo) require authentication via Sanctum tokens.

---

## Real Runtime Trace Architecture

In the future, CodeMind will support real runtime execution tracing to provide accurate line-by-line execution visualizations. 

**Why runtime tracing must be isolated:**
Executing user-submitted code is inherently dangerous. It must be completely isolated from the main backend (Laravel) to prevent remote code execution (RCE) vulnerabilities, filesystem access, or network abuse. 

**Architecture Flow:**
1. **React Frontend** -> requests execution trace
2. **Laravel API** -> orchestrates the request, validates input, but does not execute the code
3. **Node.js Tracer Service** -> a separate, sandboxed service that receives the code
4. **Sandbox execution** -> the Tracer Service executes the code in a heavily restricted environment
5. **Trace steps returned** -> the Tracer Service returns line-by-line step data
6. **Laravel stores/returns trace** -> Laravel receives the trace and returns it to the client
7. **React visualizes trace** -> the frontend visualizer renders the actual execution timeline

**Safety Boundaries and Limitations:**
- Laravel acts only as an orchestrator; it must never execute user code directly.
- The Node.js Tracer Service handles all execution inside a sandbox.
- **Strict Sandbox Rules:** No filesystem access, no network access, no require/import access, and no DOM/browser APIs.
- **Resource Limits:** Strict timeout limits, memory limits, and maximum step counts are enforced to prevent infinite loops and denial-of-service (DoS).
- **Untrusted Code:** All source code is treated as untrusted. The tracer returns only safe, structured trace data.
- **Error Handling:** Internal errors or stack traces from the tracer are never exposed to the frontend.
