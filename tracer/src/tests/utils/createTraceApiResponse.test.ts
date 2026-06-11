import { describe, it, expect } from 'vitest';
import {
  createPlannedTraceResponse,
  createExecutedTraceResponse,
  createErrorTraceResponse,
} from '../../utils/createTraceApiResponse.js';
import type { TracePlan } from '../../types/trace.js';
import type { InterpreterResult } from '../../types/interpreter.js';

describe('createTraceApiResponse', () => {
  const dummyPlan: TracePlan = {
    steps: [],
    supported: true,
    limitations: [],
  };

  it('planned response includes all required top-level keys', () => {
    const response = createPlannedTraceResponse({
      message: 'Test message',
      plan: dummyPlan,
      entryFunction: 'main',
    });

    expect(response.success).toBe(false);
    expect(response.executionEnabled).toBe(false);
    expect(response.mode).toBe('planned');
    expect(response.message).toBe('Test message');
    expect(response.trace.steps).toEqual([]);
    expect(response.trace.summary.terminatedReason).toBe('not_executed');
    expect(response.result).toBeNull();
    expect(response.plan).toBe(dummyPlan);
    expect(response.error).toBeNull();
    expect(response.metadata.language).toBe('javascript');
    expect(response.metadata.entryFunction).toBe('main');
    expect(response.metadata.analyzedAt).toBeDefined();
    expect((response as any).sourceCode).toBeUndefined();
  });

  it('executed response includes result.returnedValue', () => {
    const dummyInterpreterResult: InterpreterResult = {
      success: true,
      steps: [],
      terminatedReason: 'completed',
      finalState: {
        variables: {},
        callStack: [],
        status: 'returned',
        returnedValue: 42,
        stepCount: 10,
      },
    };

    const response = createExecutedTraceResponse({
      message: 'Done',
      interpreterResult: dummyInterpreterResult,
      plan: dummyPlan,
      entryFunction: 'main',
    });

    expect(response.success).toBe(true);
    expect(response.executionEnabled).toBe(true);
    expect(response.mode).toBe('executed');
    expect(response.result?.returnedValue).toBe(42);
    expect(response.trace.summary.terminatedReason).toBe('completed');
  });

  it('error response includes stable error code and no raw stack', () => {
    const response = createErrorTraceResponse({
      message: 'Bad syntax',
      errorCode: 'PARSE_ERROR',
      executionEnabled: false,
      entryFunction: null,
    });

    expect(response.success).toBe(false);
    expect(response.mode).toBe('error');
    expect(response.error?.code).toBe('PARSE_ERROR');
    expect(response.error?.message).toBe('Bad syntax');
    expect(response.trace.steps).toEqual([]);
    expect((response as any).stack).toBeUndefined();
  });
});
