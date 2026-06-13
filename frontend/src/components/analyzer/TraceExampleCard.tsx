import React from 'react';
import { TraceExample } from '../../constants/traceExamples';
import { formatTraceValue } from '../../utils/formatTraceValue';

type Props = {
  example: TraceExample;
  onClick: () => void;
};

const categoryColors: Record<string, string> = {
  basics: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  branches: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  loops: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  arrays: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  recursion: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
};

const TraceExampleCard: React.FC<Props> = ({ example, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-start gap-2 p-4 bg-black/20 hover:bg-black/40 border border-white/5 hover:border-white/10 rounded-xl transition-all text-left"
    >
      <div className="flex items-center justify-between w-full">
        <span className="font-medium text-sm text-white">{example.title}</span>
        <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${categoryColors[example.category] || 'bg-white/10 text-white border-white/20'}`}>
          {example.category}
        </span>
      </div>
      <p className="text-xs text-white/40 line-clamp-2">{example.description}</p>
      <div className="flex items-center gap-2 mt-2 w-full flex-wrap">
        <div className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded">
          fn: {example.entryFunction}
        </div>
        {example.expectedResult !== undefined && (
          <div className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
            Expected: {formatTraceValue ? formatTraceValue(example.expectedResult) : JSON.stringify(example.expectedResult)}
          </div>
        )}
      </div>
    </button>
  );
};

export default TraceExampleCard;
