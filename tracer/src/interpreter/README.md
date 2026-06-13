# Runtime Interpreter

The runtime interpreter will eventually produce real `TraceStep` output by walking a parsed JavaScript AST.

**Important:**
- It must not use `eval`.
- It must not use the `Function` constructor.
- It must not use `vm` execution.
- It must only interpret explicitly supported AST nodes.
- Unsupported AST nodes must fail safely.
- Runtime limits must be enforced.
- Execution remains disabled until the execution gate allows it.

**Current state:**
Type contracts only. No runtime execution is implemented yet.

## Recursion Safety Rules

* Recursion must only be supported through AST interpretation.
* Recursive calls must never use eval, vm, or Function constructor.
* Every recursive call must create a new call frame.
* Every call frame must have isolated variables.
* maxCallDepth must be enforced before entering a new recursive call.
* maxSteps must still be enforced for every recorded step.
* Recursion must stop with a safe error if maxCallDepth is exceeded.
* Base cases are user code behavior; CodeMind does not assume they exist.
* Bad recursion must fail safely with MAX_CALL_DEPTH_EXCEEDED.
