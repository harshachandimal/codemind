import React from 'react';
import { TraceExample } from '../../constants/traceExamples';
import TraceExampleCard from './TraceExampleCard';

type Props = {
  examples: TraceExample[];
  onSelectExample: (example: TraceExample) => void;
};

const TraceExampleList: React.FC<Props> = ({ examples, onSelectExample }) => {
  if (examples.length === 0) {
    return (
      <div className="py-8 text-center border border-dashed border-white/10 rounded-xl bg-white/5">
        <p className="text-sm text-white/50">No examples found. Try another category or search term.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {examples.map((example) => (
        <TraceExampleCard
          key={example.id}
          example={example}
          onClick={() => onSelectExample(example)}
        />
      ))}
    </div>
  );
};

export default TraceExampleList;
