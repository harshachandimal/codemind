import React from 'react';

type Props = {
  patterns: string[] | null;
};

const PatternBadgeList: React.FC<Props> = ({ patterns }) => {
  if (!patterns || patterns.length === 0) {
    return <p className="text-sm text-white/40">No patterns detected yet.</p>;
  }

  const formatPattern = (p: string) =>
    p.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return (
    <div className="flex flex-wrap gap-2">
      {patterns.map((p, idx) => (
        <span
          key={idx}
          className="px-3 py-1 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-full text-xs font-medium"
        >
          {formatPattern(p)}
        </span>
      ))}
    </div>
  );
};

export default PatternBadgeList;
