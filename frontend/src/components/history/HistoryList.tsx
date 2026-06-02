import React from 'react';
import { Analysis } from '../../types/analysis';
import HistoryListItem from './HistoryListItem';

type Props = {
  analyses: Analysis[];
  selectedAnalysisId: number | null;
  onSelect: (analysis: Analysis) => void;
};

const HistoryList: React.FC<Props> = ({ analyses, selectedAnalysisId, onSelect }) => {
  return (
    <div className="flex flex-col gap-3 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
      {analyses.map(analysis => (
        <HistoryListItem
          key={analysis.id}
          analysis={analysis}
          selected={analysis.id === selectedAnalysisId}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
};

export default HistoryList;
