import { TracePlayerStep } from '../types/tracePlayer';

export function normalizeTraceSteps(rawSteps: unknown[]): TracePlayerStep[] {
  if (!Array.isArray(rawSteps)) {
    return [];
  }

  return rawSteps.map((rawStep, index) => {
    try {
      if (typeof rawStep !== 'object' || rawStep === null) {
        return createFallbackStep(index, rawStep);
      }

      const stepRecord = rawStep as Record<string, unknown>;
      
      const type = typeof stepRecord.type === 'string' ? stepRecord.type : 'unknown';
      const description = typeof stepRecord.description === 'string' ? stepRecord.description : '';
      const title = typeof stepRecord.title === 'string' ? stepRecord.title : `Step ${index + 1}`;
      
      let variables: Record<string, unknown> | undefined;
      if (stepRecord.variables && typeof stepRecord.variables === 'object') {
        variables = { ...stepRecord.variables } as Record<string, unknown>;
      }

      let callStack: string[] | undefined;
      if (Array.isArray(stepRecord.callStack)) {
        callStack = stepRecord.callStack.filter((s): s is string => typeof s === 'string');
      }

      const returnedValue = stepRecord.returnedValue !== undefined ? stepRecord.returnedValue : undefined;

      let lineNumber: number | null = null;
      if (typeof stepRecord.lineNumber === 'number') {
        lineNumber = stepRecord.lineNumber;
      } else if (typeof stepRecord.line === 'number') {
        lineNumber = stepRecord.line;
      } else if (stepRecord.loc && typeof (stepRecord.loc as any).start?.line === 'number') {
        lineNumber = (stepRecord.loc as any).start.line;
      }

      const operation = typeof stepRecord.operation === 'string' ? stepRecord.operation : null;
      
      let variableChanges: string[] = [];
      if (Array.isArray(stepRecord.variableChanges)) {
        variableChanges = stepRecord.variableChanges.filter((v): v is string => typeof v === 'string');
      }

      return {
        id: `step-${index}-${Date.now()}`,
        index,
        type,
        title,
        description,
        variables,
        callStack,
        returnedValue,
        lineNumber,
        operation,
        variableChanges,
        rawStep,
      };
    } catch (e) {
      return createFallbackStep(index, rawStep);
    }
  });
}

function createFallbackStep(index: number, rawStep: unknown): TracePlayerStep {
  return {
    id: `fallback-${index}-${Date.now()}`,
    index,
    type: 'unknown',
    title: `Step ${index + 1}`,
    description: 'Trace step data could not be parsed.',
    rawStep,
  };
}
