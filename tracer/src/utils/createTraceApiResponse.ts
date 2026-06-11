import type { TraceApiResponse } from '../types/api.js';
import type { TracePlan } from '../types/trace.js';
import type { InterpreterResult } from '../types/interpreter.js';

export function createPlannedTraceResponse(params: {
  message: string;
  plan: TracePlan;
  entryFunction: string | null;
}): TraceApiResponse {
  return {
    success: false,
    executionEnabled: false,
    mode: 'planned',
    message: params.message,
    trace: {
      steps: [],
      summary: {
        totalSteps: 0,
        terminatedReason: 'not_executed',
      },
    },
    result: null,
    plan: params.plan,
    error: null,
    metadata: {
      language: 'javascript',
      entryFunction: params.entryFunction,
      analyzedAt: new Date().toISOString(),
    },
  };
}

export function createExecutedTraceResponse(params: {
  message: string;
  interpreterResult: InterpreterResult;
  plan: TracePlan | null;
  entryFunction: string | null;
}): TraceApiResponse {
  // Gracefully construct the summary even if the interpreterResult doesn't fully conform yet,
  // though the interpreter returns steps and finalState.
  return {
    success: true,
    executionEnabled: true,
    mode: 'executed',
    message: params.message,
    trace: {
      steps: params.interpreterResult.steps,
      summary: {
        totalSteps: params.interpreterResult.steps.length,
        terminatedReason: params.interpreterResult.terminatedReason ?? 'completed',
      },
    },
    result: {
      returnedValue: params.interpreterResult.finalState.returnedValue,
    },
    plan: params.plan,
    error: null,
    metadata: {
      language: 'javascript',
      entryFunction: params.entryFunction,
      analyzedAt: new Date().toISOString(),
    },
  };
}

export function createErrorTraceResponse(params: {
  message: string;
  errorCode: string;
  executionEnabled: boolean;
  plan?: TracePlan | null;
  entryFunction: string | null;
}): TraceApiResponse {
  return {
    success: false,
    executionEnabled: params.executionEnabled,
    mode: 'error',
    message: params.message,
    trace: {
      steps: [],
      summary: {
        totalSteps: 0,
        terminatedReason: 'error',
      },
    },
    result: null,
    plan: params.plan ?? null,
    error: {
      code: params.errorCode,
      message: params.message,
    },
    metadata: {
      language: 'javascript',
      entryFunction: params.entryFunction,
      analyzedAt: new Date().toISOString(),
    },
  };
}
