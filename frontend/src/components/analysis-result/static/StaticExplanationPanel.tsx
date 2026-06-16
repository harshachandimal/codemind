import React from 'react';

type Props = {
  explanation: string | null;
};

const StaticExplanationPanel: React.FC<Props> = ({ explanation }) => {
  if (!explanation) return null;

  // Split on newlines to preserve readable paragraph spacing
  const paragraphs = explanation
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-6 flex flex-col gap-4 shadow-xl shadow-black/30 backdrop-blur-sm">
      {/* Section heading */}
      <div className="flex flex-col gap-1">
        <p className="text-[10px] font-bold tracking-widest uppercase text-indigo-400">
          Explanation
        </p>
        <p className="text-xs text-white/35 leading-relaxed">
          CodeMind's interpretation of the algorithm's behaviour.
        </p>
      </div>

      {/* Explanation body */}
      <div className="flex flex-col gap-3 max-w-prose">
        {paragraphs.map((para, i) => (
          <p
            key={i}
            className="text-sm text-white/65 leading-7 tracking-[0.01em]"
          >
            {para}
          </p>
        ))}
      </div>

      {/* Disclaimer */}
      <p className="text-[10px] text-white/20 leading-relaxed border-t border-white/[0.05] pt-4">
        ⓘ This explanation is derived from static pattern analysis, not live execution.
      </p>
    </div>
  );
};

export default StaticExplanationPanel;
