import React from 'react';
import { Analysis } from '../../types/analysis';

type Props = {
  analysis: Analysis;
  selected: boolean;
  onSelect: (analysis: Analysis) => void;
};

const HistoryListItem: React.FC<Props> = ({ analysis, selected, onSelect }) => {
  const date = new Date(analysis.created_at).toLocaleDateString();

  return (
    <button
      onClick={() => onSelect(analysis)}
      className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex flex-col gap-2 ${
        selected
          ? 'bg-indigo-500/10 border-indigo-500/50'
          : 'bg-[#0d1117] border-white/5 hover:border-white/20 hover:bg-white/[0.02]'
      }`}
    >
      <div className="flex items-start justify-between w-full">
        <h3 className={`font-semibold truncate ${selected ? 'text-indigo-400' : 'text-white'}`}>
          {analysis.title || 'Untitled analysis'}
        </h3>
        <span className="text-xs text-white/40 whitespace-nowrap ml-2">{date}</span>
      </div>
      
      <div className="flex items-center gap-3 text-xs text-white/50">
        <span className="capitalize">{analysis.language}</span>
        <span>•</span>
        <span className={`capitalize ${analysis.status === 'completed' ? 'text-emerald-400' : ''}`}>
          {analysis.status}
        </span>
      </div>
      
      <div className="flex items-center gap-3 text-xs font-mono">
        <span className="text-white/40">Time: <span className="text-white/70">{analysis.time_complexity || '-'}</span></span>
        <span className="text-white/40">Space: <span className="text-white/70">{analysis.space_complexity || '-'}</span></span>
      </div>
    </button>
  );
};

export default HistoryListItem;
