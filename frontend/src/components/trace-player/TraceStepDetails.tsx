import React from 'react';
import { TracePlayerStep } from '../../types/tracePlayer';
import { formatTraceValue } from '../../utils/formatTraceValue';

type Props = {
  step: TracePlayerStep | null;
};

export const TraceStepDetails: React.FC<Props> = ({ step }) => {
  if (!step) {
    return (
      <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6 flex items-center justify-center min-h-[220px]">
        <p className="text-slate-500">No step selected</p>
      </div>
    );
  }

  return (
    <div className="box-border w-full min-w-0 bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-5 shadow-lg flex flex-col gap-4 h-fit min-h-[220px] max-h-[520px]">
      <div className="flex flex-col gap-2 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center bg-indigo-500/20 text-indigo-300 w-8 h-8 rounded-full font-bold text-sm border border-indigo-500/30">
            {step.index + 1}
          </span>
          <h3 className="text-xl font-bold text-slate-100 tracking-tight">
            {step.title}
          </h3>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 mt-1">
          <span className="text-xs px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 font-medium">
            Type: <span className="text-slate-100">{step.type}</span>
          </span>
          
          {step.operation && (
            <span className="text-xs px-2.5 py-1 rounded-md bg-emerald-900/40 text-emerald-300 font-medium border border-emerald-800/50">
              {step.operation}
            </span>
          )}

          {step.lineNumber !== null && step.lineNumber !== undefined && (
            <span className="text-xs px-2.5 py-1 rounded-md bg-indigo-900/40 text-indigo-300 font-medium border border-indigo-800/50">
              Line {step.lineNumber}
            </span>
          )}
        </div>
      </div>
      
      <div className="flex-1 text-base text-slate-300 leading-relaxed overflow-auto custom-scrollbar pr-2 whitespace-pre-wrap">
        {step.description || 'No description provided for this step.'}
      </div>

      {step.returnedValue !== undefined && (
        <div className="pt-4 border-t border-slate-800">
          <h4 className="text-xs uppercase tracking-widest text-slate-500 mb-2 font-semibold">Returned Value</h4>
          <div className="font-mono text-sm bg-slate-950 p-3 rounded-lg text-emerald-400 overflow-x-auto border border-slate-800">
            {formatTraceValue(step.returnedValue)}
          </div>
        </div>
      )}
    </div>
  );
};
