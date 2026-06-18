export function getRuntimeTraceSteps(analysis: any): unknown[] {
  if (!analysis) return [];
  if (Array.isArray(analysis.trace_steps)) return analysis.trace_steps;
  if (Array.isArray(analysis.runtimeTrace?.steps)) return analysis.runtimeTrace.steps;
  if (Array.isArray(analysis.runtime_trace?.steps)) return analysis.runtime_trace.steps;
  if (Array.isArray(analysis.trace?.steps)) return analysis.trace.steps;
  if (Array.isArray(analysis.runtime?.steps)) return analysis.runtime.steps;
  if (Array.isArray(analysis.runtime_trace?.trace?.steps)) return analysis.runtime_trace.trace.steps;
  return [];
}
