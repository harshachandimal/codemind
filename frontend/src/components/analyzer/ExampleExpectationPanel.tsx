import React from 'react';
import type { TraceExample } from '../../constants/traceExamples';
import type { Analysis } from '../../types/analysis';
import { formatTraceValue } from '../../utils/formatTraceValue';

type ExampleExpectationPanelProps = {
  example: TraceExample | null;
  analysis: Analysis | null;
};

const ExampleExpectationPanel: React.FC<ExampleExpectationPanelProps> = ({ example, analysis }) => {
  if (!example || example.expectedResult === undefined) return null;

  const expectedStr = formatTraceValue ? formatTraceValue(example.expectedResult) : JSON.stringify(example.expectedResult);
  
  const actualResult = analysis?.trace_result?.returnedValue;
  const hasActual = actualResult !== undefined;
  
  const actualStr = hasActual ? (formatTraceValue ? formatTraceValue(actualResult) : JSON.stringify(actualResult)) : '';
  
  const isMatch = hasActual && expectedStr === actualStr;

  return (
    <div className="bg-black/20 border border-white/10 rounded-xl p-6 flex flex-col gap-4">
      <h3 className="text-sm font-bold text-white uppercase tracking-widest">Example Expectation</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-white/50">Expected Result</span>
          <div className="bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-sm font-mono text-indigo-400 overflow-x-auto">
            {expectedStr}
          </div>
        </div>
        
        <div className="flex flex-col gap-1">
          <span className="text-xs text-white/50">Actual Result</span>
          {hasActual ? (
            <div className={`border rounded-lg px-3 py-2 text-sm font-mono overflow-x-auto ${isMatch ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
              {actualStr}
            </div>
          ) : (
            <div className="bg-white/5 border border-dashed border-white/10 rounded-lg px-3 py-2 text-xs text-white/40 italic">
              Actual runtime result is available only when runtime tracing executes successfully.
            </div>
          )}
        </div>
      </div>
      
      {hasActual && (
        <div className={`text-sm font-medium ${isMatch ? 'text-emerald-400' : 'text-rose-400'}`}>
          {isMatch 
            ? '✓ Returned value matches the example expectation.' 
            : '✗ Returned value does not match the example expectation.'}
        </div>
      )}
    </div>
  );
};

export default ExampleExpectationPanel;
