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
    <div className="flex min-w-0 w-full flex-col gap-3 h-full">
      <div className="flex-[2] overflow-hidden min-h-[200px] min-w-0">
        <TraceVariablesPanel 
          variables={step?.variables} 
          previousVariables={previousStep?.variables}
          variableChanges={step?.variableChanges} 
        />
      </div>
      <div className="flex-1 overflow-hidden min-h-[150px] min-w-0">
        <TraceCallStackPanel callStack={step?.callStack} />
      </div>
      <div className="flex-1 overflow-hidden min-h-[120px] min-w-0">
        <RuntimeDiagnosticsPanel 
          runtimeError={runtimeError} 
          warnings={warnings} 
          steps={allSteps} 
          returnedValue={step?.returnedValue} 
        />
      </div>
    </div>
  );
};
