import type { TraceStep, TraceSummary, TracePlan } from './trace.js';
import type { RuntimeValue } from './interpreter.js';

export type TraceApiResponse = {
  success: boolean;
  executionEnabled: boolean;
  mode: 'planned' | 'executed' | 'error';
  message: string;
  trace: {
    steps: TraceStep[];
    summary: TraceSummary;
  };
  result: {
    returnedValue: RuntimeValue | undefined;
  } | null;
  plan: TracePlan | null;
  error: {
    code: string;
    message: string;
  } | null;
  metadata: {
    language: 'javascript' | 'python' | 'java';
    entryFunction: string | null;
    analyzedAt: string;
  };
};
