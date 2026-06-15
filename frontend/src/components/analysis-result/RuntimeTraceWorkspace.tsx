import React from 'react';
import type { Analysis } from '../../types/analysis';
import { RuntimeTracePlayer } from '../trace-player/RuntimeTracePlayer';
import { formatTraceValue } from '../../utils/formatTraceValue';
import { TracePlayerStep } from '../../types/tracePlayer';

type Props = {
  analysis: Analysis;
  onStepChange?: (step: TracePlayerStep | null) => void;
};


export const RuntimeTraceWorkspace: React.FC<Props> = ({ analysis, onStepChange }) => {
  const hasRuntimeError = !!analysis.trace_error;
  const isRuntimeAvailable = !['unsupported_language', 'unsupported', 'not_available'].includes(analysis.trace_mode as string);
  const steps = analysis.trace_steps || [];
  const hasSteps = steps.length > 0;

  const returnedValue = analysis.trace_result?.returnedValue;

  if (!isRuntimeAvailable) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-slate-900/30 rounded-xl border border-slate-800/60 text-center gap-3 h-full min-h-[300px]">
        <div className="w-12 h-12 rounded-full bg-slate-800/50 flex items-center justify-center text-slate-500 mb-2">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-slate-300">Runtime trace not available</h3>
        <p className="text-sm text-slate-500 max-w-md">
          Runtime trace is not available for this analysis. Static analysis is still available.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300 min-w-0 w-full">
      {(hasSteps || hasRuntimeError) ? (
        <>
          <div className="flex flex-wrap items-stretch gap-4">
            <div className="flex-1 bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 min-w-[200px]">
              <h3 className="text-xs font-semibold tracking-widest uppercase text-slate-500 mb-2">Runtime Status</h3>
              <div className={`flex items-center gap-2 font-medium text-sm ${hasRuntimeError ? 'text-rose-400' : 'text-emerald-400'}`}>
                <span className={`w-2 h-2 rounded-full animate-pulse ${hasRuntimeError ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                {hasRuntimeError ? 'Execution Failed' : 'Successfully Executed'}
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Captured {steps.length} trace steps.
              </p>
            </div>

            {returnedValue !== undefined && !hasRuntimeError && (
              <div className="flex-1 bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 min-w-[200px]">
                <h3 className="text-xs font-semibold tracking-widest uppercase text-emerald-500/70 mb-2">Returned Value</h3>
                <div className="font-mono text-sm text-emerald-400 bg-slate-950/50 px-3 py-2 rounded-lg border border-emerald-900/20 overflow-x-auto">
                  {formatTraceValue(returnedValue)}
                </div>
              </div>
            )}
          </div>

          <RuntimeTracePlayer 
            rawSteps={steps} 
            language={analysis.language} 
            onStepChange={onStepChange} 
            runtimeError={analysis.trace_error?.message || analysis.trace_error}
            warnings={(analysis as any).trace_warnings || []}
          />
        </>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 bg-slate-900/30 rounded-xl border border-slate-800/60 text-center gap-3 h-full min-h-[300px]">
          <p className="text-sm text-slate-500">
            No trace steps were captured during execution.
          </p>
        </div>
      )}
    </div>
  );
};
