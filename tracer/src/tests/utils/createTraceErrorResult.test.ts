import { describe, it, expect } from 'vitest';
import { createTraceErrorResult } from '../../utils/createTraceErrorResult.js';

describe('createTraceErrorResult', () => {
  it('creates_safe_error_trace_result', () => {
    const result = createTraceErrorResult('Something failed safely.');
    expect(result.success).toBe(false);
    expect(result.steps.length).toBe(1);
    expect(result.steps[0]?.type).toBe('error');
    expect(result.steps[0]?.description).toBe('Something failed safely.');
    expect(result.summary.totalSteps).toBe(1);
    expect(result.summary.terminatedReason).toBe('error');
  });

  it('supports_timeout_terminated_reason', () => {
    const result = createTraceErrorResult('Timed out.', 'timeout');
    expect(result.summary.terminatedReason).toBe('timeout');
  });
});
