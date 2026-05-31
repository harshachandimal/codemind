# CodeMind — Development Rules

These rules govern how CodeMind is built. They exist to maintain code quality, security, and long-term maintainability. All contributors must follow them.

---

## 1. Use Small Steps

**Rule:** Each phase and task must be broken into the smallest reasonable units of work. Never try to implement multiple unrelated things in a single step.

**Why:** Small steps make it easy to isolate bugs, review changes, and roll back safely. Large changes are difficult to test and debug.

**Practice:**
- One feature per commit or PR
- One endpoint per ticket
- Test each step before moving to the next

---

## 2. Do Not Over-Engineer Early

**Rule:** Do not build abstractions, generalization layers, or infrastructure that is not needed right now.

**Why:** Over-engineering wastes time, creates complexity that is hard to change, and often solves problems that don't actually exist yet.

**Practice:**
- Do not introduce microservices until Phase 12
- Do not add Redis until Phase 10
- Do not build a plugin system unless explicitly required
- If in doubt, write the simple version first

---

## 3. Keep Controllers Thin

**Rule:** Laravel controllers must contain only HTTP-level logic: receive request, delegate to a service, return a response.

**Why:** Business logic in controllers cannot be reused, tested in isolation, or refactored easily.

**Correct:**
```php
public function store(StoreAnalysisRequest $request): JsonResponse
{
    $result = $this->analysisService->analyse($request->validated());
    return new AnalysisResource($result);
}
```

**Incorrect:**
```php
public function store(Request $request): JsonResponse
{
    // 50 lines of regex parsing, DB queries, and conditionals directly here
}
```

---

## 4. Use Service Classes for Business Logic

**Rule:** All business logic must live in dedicated Service classes, not in controllers, models, or middleware.

**Why:** Services are independently testable, reusable, and easier to reason about in isolation.

**Convention:**
- Service classes live in `app/Services/`
- Each service has a single, clearly defined responsibility
- Services are injected into controllers via the constructor (dependency injection)

**Examples:**
- `AnalysisService` — orchestrates the analysis flow
- `ComplexityEstimatorService` — estimates time and space complexity
- `ExplainerService` — generates plain-English explanations
- `AiExplainerService` — calls the AI API (future)

---

## 5. Use Request Validation

**Rule:** All incoming data must be validated using Laravel Form Requests. Never trust user input. Never validate inside controllers manually.

**Why:** Centralized validation is reusable, testable, and produces consistent error responses automatically.

**Convention:**
- Validation classes live in `app/Http/Requests/`
- Use `$request->validated()` — never `$request->all()` or `$request->input()` directly

**Example:**
```php
class StoreAnalysisRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'code'     => ['required', 'string', 'max:10000'],
            'language' => ['required', 'string', 'in:javascript'],
        ];
    }
}
```

---

## 6. Use API Resources

**Rule:** All API responses must be transformed through Laravel API Resources. Never return Eloquent models or raw arrays directly from controllers.

**Why:** Resources decouple the database schema from the API contract. You can rename columns or restructure models without breaking the API response shape.

**Convention:**
- Resources live in `app/Http/Resources/`
- Always use `AnalysisResource` (singular) and `AnalysisCollection` or `AnaysisResource::collection()` for lists

**Example:**
```php
// Good
return new AnalysisResource($analysis);

// Bad
return response()->json($analysis->toArray());
```

---

## 7. Write Tests for Analysis Logic

**Rule:** Every Service class that performs analysis logic (complexity estimation, explanation, tracing) must have unit tests. Every API endpoint must have feature tests.

**Why:** Analysis logic is the core value of this product. Bugs in complexity estimation would undermine user trust entirely. Tests are the only reliable way to catch regressions.

**Convention:**
- Unit tests live in `tests/Unit/Services/`
- Feature tests live in `tests/Feature/`
- Use `php artisan test` to run the full suite
- All tests must pass before merging or moving to the next phase

**Minimum coverage targets:**
- Services: 100% of public methods tested
- API endpoints: All happy paths + key error paths tested

---

## 8. Never Execute Untrusted User Code Directly

**Rule:** User-submitted JavaScript code must **never be executed** on the server — not via `eval()`, not via `shell_exec()`, not via a Node.js child process, not in any other form.

**Why:** Executing untrusted code is one of the most critical security vulnerabilities possible. It could allow attackers to take full control of the server, exfiltrate data, or destroy infrastructure.

**Allowed:** Treat user code as a **plain string**. Read it, pattern-match it, parse it as text, send it to a sandboxed external service — but never run it.

**Future Node.js service:** Even the future Node.js analysis microservice must use static AST parsing only (via Babel/Acorn), never `eval()` or `vm.runInNewContext()` with untrusted input.

---

## 9. Do Not Make Destructive Filesystem Changes

**Rule:** No command or script should delete, overwrite, or truncate files unless there is an explicit confirmation step. Never run commands like `rm -rf`, `DROP TABLE`, or destructive migrations without awareness of consequences.

**Why:** Accidents happen. Destructive operations without safeguards can cause irreversible data loss.

**Practice:**
- Migrations must be reviewed before running against production databases
- Seeders must not truncate production data
- No `--force` flags on dangerous operations without explicit justification

---

## 10. Explain Commands Before Running Them

**Rule:** Before running any non-trivial terminal command (especially anything that installs packages, modifies configuration, or affects the database), explain what the command does and why it is being run.

**Why:** Blind command execution creates security risks and makes it impossible to debug problems later. Understanding what runs on the system is a professional responsibility.

**Format:**
```
Command: php artisan migrate
Purpose: Runs all pending database migrations to create/update tables.
Effect:  Creates the `analyses` table as defined in the migration file.
```

This rule applies to both human contributors and AI-assisted development.

---

## 11. Frontend Component Size Rule

Frontend UI components should stay below 100 lines whenever possible.

If a component grows beyond 100 lines, split it into smaller focused components.

Examples:
- Page component should coordinate layout and data flow.
- UI card component should only render one card.
- Loading, error, and success states should be separate components when they grow.
- Reusable buttons, badges, cards, panels, and layout sections should live in src/components.

**Why:** Small components are easier to read, test, debug, reuse, and maintain.

---

## 12. Authentication Rules

- Never store plain-text passwords.
- Always hash passwords using Laravel's hashing tools.
- Never return password hashes in API responses.
- Never expose authentication tokens in logs.
- Protect authenticated routes using auth:sanctum.
- Validate all auth requests using Form Requests.
- Keep auth controllers thin.
- Put auth business logic in service/action classes where practical.
- Frontend should not hardcode secrets.
- Frontend should attach the token only through the API client layer.
- Auth controllers must stay thin.
- Register/login validation must use Form Requests.
- User output must use API Resources.
- Auth use cases should be placed in Actions when practical.
- Token creation should not be duplicated across controllers.
