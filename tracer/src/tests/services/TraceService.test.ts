import { describe, it, expect } from 'vitest';
import { TraceService } from '../../services/TraceService.js';

describe('TraceService', () => {
  const service = new TraceService();

  it('returns_placeholder_for_valid_safe_request', () => {
    const validRequest = {
      language: 'javascript',
      sourceCode: 'function add(a, b) { return a + b; }',
      entryFunction: 'add',
      input: [1, 2],
    };

    const result = service.trace(validRequest);

    expect(result.success).toBe(false); // execution not yet implemented
    expect(result.steps.length).toBeGreaterThan(0);

    const step = result.steps[0];
    expect(step?.description).toContain('Runtime tracing is not implemented yet');
    expect(step?.description).toContain('trace planning succeeded');
    expect(step?.description).toContain('Runtime execution is currently disabled');

    // Plan metadata and gate state in variables
    expect(step?.variables['plannedSteps']).toBeGreaterThan(0);
    expect(step?.variables['supported']).toBe(true);
    expect(step?.variables['executionEnabled']).toBe(false);

    expect(result.summary.terminatedReason).toBe('error');
  });

  it('returns_safe_error_for_invalid_request', () => {
    const invalidRequest = {
      language: 'python',
      sourceCode: 'print("hi")',
    };

    const result = service.trace(invalidRequest);

    expect(result.success).toBe(false);
    expect(result.steps[0]?.type).toBe('error');
    expect(result.steps[0]?.description).toContain('Invalid trace request');
  });

  it('returns_safe_error_for_preflight_blocked_code', () => {
    const dangerousRequest = {
      language: 'javascript',
      sourceCode: "function bad() { eval('2 + 2'); }",
      entryFunction: 'bad',
    };

    const result = service.trace(dangerousRequest);

    expect(result.success).toBe(false);
    expect(result.steps[0]?.type).toBe('error');
    expect(result.steps[0]?.description).toContain('safety preflight');
    expect(result.steps[0]?.description).toContain('eval');
  });

  it('returns_safe_error_for_unparseable_source', () => {
    const badSyntaxRequest = {
      language: 'javascript',
      sourceCode: 'function broken( {',
      entryFunction: 'broken',
    };

    const result = service.trace(badSyntaxRequest);

    expect(result.success).toBe(false);
    expect(result.steps[0]?.type).toBe('error');
    expect(result.steps[0]?.description).toBe(
      'JavaScript source could not be parsed.',
    );
    // No raw source code should appear anywhere in the result
    expect(JSON.stringify(result)).not.toContain('function broken');
  });
});
