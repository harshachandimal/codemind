import { describe, it, expect } from 'vitest';
import { TraceService } from '../../services/TraceService.js';

describe('TraceService', () => {
  const service = new TraceService();

  it('default_valid_request_returns_planned_mode', () => {
    const validRequest = {
      language: 'javascript',
      sourceCode: 'function add(a, b) { return a + b; }',
      entryFunction: 'add',
      input: [1, 2],
    };

    const result = service.trace(validRequest);

    expect(result.success).toBe(false);
    expect(result.mode).toBe('planned');
    expect(result.executionEnabled).toBe(false);
    expect(result.plan).not.toBeNull();
    expect(result.result).toBeNull();
    expect(result.error).toBeNull();
    expect(result.metadata.language).toBe('javascript');
    expect((result as any).sourceCode).toBeUndefined();
    expect(result.trace.steps).toEqual([]);
    expect(result.trace.summary.terminatedReason).toBe('not_executed');
  });

  it('invalid_language_returns_error_contract', () => {
    const invalidRequest = {
      language: 'python',
      sourceCode: 'print("hi")',
    };

    const result = service.trace(invalidRequest);

    expect(result.success).toBe(false);
    expect(result.mode).toBe('error');
    expect(result.error?.code).toBe('VALIDATION_ERROR');
    expect(result.error?.message).toContain('Invalid trace request');
    expect(JSON.stringify(result)).not.toContain('print("hi")'); // No source code
  });

  it('unsupported_syntax_returns_error_contract', () => {
    const badSyntaxRequest = {
      language: 'javascript',
      sourceCode: 'class User {}',
      entryFunction: 'User',
    };

    const result = service.trace(badSyntaxRequest);

    expect(result.success).toBe(false);
    expect(result.mode).toBe('error');
    expect(result.error?.code).toBe('UNSUPPORTED_SYNTAX');
    expect(JSON.stringify(result)).not.toContain('class User');
  });

  it('preflight_blocked_code_returns_error_contract', () => {
    const dangerousRequest = {
      language: 'javascript',
      sourceCode: "function bad() { eval('2 + 2'); }",
      entryFunction: 'bad',
    };

    const result = service.trace(dangerousRequest);

    expect(result.success).toBe(false);
    expect(result.mode).toBe('error');
    expect(result.error?.code).toBe('SAFETY_ERROR');
    expect(result.error?.message).toContain('safety preflight');
  });
});
