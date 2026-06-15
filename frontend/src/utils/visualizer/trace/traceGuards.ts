import { Analysis } from '../../../types/analysis';


export function hasExecutedTrace(analysis: Analysis): boolean {
  return analysis.trace_mode === 'executed'
    && Array.isArray(analysis.trace_steps)
    && analysis.trace_steps.length > 0;
}

export function hasTracePlan(analysis: Analysis): boolean {
  return analysis.trace_mode === 'planned'
    && analysis.trace_plan !== null;
}

export function hasTraceError(analysis: Analysis): boolean {
  return analysis.trace_mode === 'error'
    && analysis.trace_error !== null;
}
