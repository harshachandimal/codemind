import React from 'react';
import { TraceVariablesPanel } from './TraceVariablesPanel';
import { TraceCallStackPanel } from './TraceCallStackPanel';
import { RuntimeDiagnosticsPanel } from './RuntimeDiagnosticsPanel';
import { TracePlayerStep } from '../../types/tracePlayer';

type Props = {
  step?: TracePlayerStep | null;
  previousStep?: TracePlayerStep | null;
  allSteps?: TracePlayerStep[];
  runtimeError?: unknown;
  warnings?: string[];
};

export const RuntimeStatePanel: React.FC<Props> = ({ step, previousStep, allSteps, runtimeError, warnings }) => {
  return (
    <div className="flex min-w-0 w-full flex-col gap-4">
      <TraceVariablesPanel 
        variables={step?.variables} 
        previousVariables={previousStep?.variables}
        variableChanges={step?.variableChanges} 
      />
      <TraceCallStackPanel callStack={step?.callStack} />
      <RuntimeDiagnosticsPanel 
        runtimeError={runtimeError} 
        warnings={warnings} 
        steps={allSteps} 
        returnedValue={step?.returnedValue} 
      />
    </div>
  );
};
