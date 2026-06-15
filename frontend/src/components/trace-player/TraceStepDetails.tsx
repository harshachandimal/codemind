import React from 'react';
import { TracePlayerStep } from '../../types/tracePlayer';
import { formatTraceValue } from '../../utils/formatTraceValue';

type Props = {
  step: TracePlayerStep | null;
};

export const TraceStepDetails: React.FC<Props> = ({ step }) => {
  if (!step) {
    return (
      <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-6 flex items-center justify-center h-full">
        <p className="text-slate-500">No step selected</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-lg p-5 shadow-lg flex flex-col gap-3">
      <div className="flex items-start justify-between border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-100 flex items-center gap-2">
            {step.title}
          </h3>
          <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
            Type: {step.type}
          </span>
        </div>
      </div>
      
      <div className="text-sm text-slate-300 leading-relaxed min-h-[3rem]">
        {step.description || 'No description provided for this step.'}
      </div>

      {step.returnedValue !== undefined && (
        <div className="mt-2 pt-3 border-t border-slate-800">
          <h4 className="text-xs uppercase tracking-wider text-slate-500 mb-1">Returned Value</h4>
          <div className="font-mono text-sm bg-slate-950 p-2 rounded text-emerald-400 overflow-x-auto">
            {formatTraceValue(step.returnedValue)}
          </div>
        </div>
      )}
    </div>
  );
};
