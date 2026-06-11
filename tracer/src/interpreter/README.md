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
