export type TraceErrorPresentation = {
  title: string;
  description: string;
  suggestion: string;
  tone: 'info' | 'warning' | 'danger' | 'neutral';
};

export function getTraceErrorPresentation(
  code: string | null | undefined,
  fallbackMessage?: string | null
): TraceErrorPresentation {
  switch (code) {
    case 'TRACER_UNAVAILABLE':
      return {
        title: 'Tracer service is unavailable',
        description: 'CodeMind could not reach the runtime tracer service.',
        suggestion: 'Try again after starting the tracer service, or continue using static complexity analysis.',
        tone: 'warning',
      };
    case 'SAFETY_ERROR':
      return {
        title: 'Code was blocked by safety checks',
        description: 'This code uses features that are not allowed in the safe tracer.',
        suggestion: 'Remove imports, eval, network calls, browser APIs, or unsafe globals and try again.',
        tone: 'danger',
      };
    case 'UNSUPPORTED_SYNTAX':
      return {
        title: 'This JavaScript syntax is not supported yet',
        description: 'The runtime tracer currently supports only a small safe subset of JavaScript.',
        suggestion: 'Try a simple function with variables, if statements, for loops, array reads, and return statements.',
        tone: 'info',
      };
    case 'PARSE_ERROR':
      return {
        title: 'Code could not be parsed',
        description: 'The JavaScript source appears to contain a syntax error.',
        suggestion: 'Check brackets, function syntax, and return statements, then try again.',
        tone: 'warning',
      };
    case 'INTERPRETER_ERROR':
      return {
        title: 'Runtime trace stopped safely',
        description: 'The tracer reached a feature or value it could not safely interpret.',
        suggestion: 'Simplify the code and use only currently supported syntax.',
        tone: 'warning',
      };
    case 'MAX_STEPS_EXCEEDED':
      return {
        title: 'Trace stopped after too many steps',
        description: 'CodeMind stopped tracing to prevent runaway execution.',
        suggestion: 'Try smaller input values or simplify loops.',
        tone: 'warning',
      };
    case 'MAX_LOOP_ITERATIONS_EXCEEDED':
      return {
        title: 'Loop limit reached',
        description: 'A loop ran longer than the safe tracing limit.',
        suggestion: 'Use smaller input values or reduce loop iterations.',
        tone: 'warning',
      };
    case 'VALIDATION_ERROR':
      return {
        title: 'Invalid trace request',
        description: 'The trace configuration contains invalid or missing values.',
        suggestion: 'Ensure your entry function name and input arguments are correctly formatted.',
        tone: 'warning',
      };
    case 'EXECUTION_DISABLED':
      return {
        title: 'Execution is disabled',
        description: 'The tracer is running but execution is currently disabled.',
        suggestion: 'Enable execution in the tracer configuration to see runtime steps.',
        tone: 'neutral',
      };
    default: {
      const cleanFallback = fallbackMessage && !fallbackMessage.includes(' at ') && !fallbackMessage.includes('/') && !fallbackMessage.includes('\\')
        ? fallbackMessage
        : 'CodeMind could not produce a runtime trace for this analysis.';

      return {
        title: 'Runtime trace is not available',
        description: cleanFallback,
        suggestion: 'You can still review the static complexity analysis.',
        tone: 'neutral',
      };
    }
  }
}
