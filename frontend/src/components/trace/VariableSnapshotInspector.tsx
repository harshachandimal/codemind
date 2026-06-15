import React from 'react';
import { formatTraceValue } from '../../utils/visualizer/formatters/formatTraceValue';

type Props = {
  variables: Record<string, unknown> | null | undefined;
  maxItems?: number;
  highlightedKeys?: string[];
};

const VariableSnapshotInspector: React.FC<Props> = ({
  variables,
  maxItems = 6,
  highlightedKeys = [],
}) => {
  if (!variables) return null;

  const entries = Object.entries(variables);
  if (entries.length === 0) return null;

  const visible = entries.slice(0, maxItems);
  const overflow = entries.length - visible.length;

  return (
    <div className="mt-0.5 bg-black/20 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-2.5 pt-1.5 pb-1 border-b border-white/[0.05]">
        <span className="text-[9px] font-semibold tracking-widest uppercase text-white/25">
          Variables
        </span>
      </div>

      {/* Entries */}
      <div className="flex flex-col divide-y divide-white/[0.04]">
        {visible.map(([key, value]) => {
          const isHighlighted = highlightedKeys.includes(key);
          return (
            <div
              key={key}
              className={[
                'flex items-start gap-2 px-2.5 py-1.5 text-[10px] font-mono',
                isHighlighted ? 'bg-emerald-500/[0.07]' : '',
              ].join(' ')}
            >
              <div className="flex items-center gap-1.5 shrink-0 pt-px">
                <span className={isHighlighted ? 'text-emerald-300' : 'text-indigo-300/65'}>
                  {key}
                </span>
                {isHighlighted && (
                  <span className="text-[8px] font-bold uppercase tracking-wider text-emerald-400/80 bg-emerald-500/10 border border-emerald-500/20 px-1 py-px rounded-full leading-none">
                    changed
                  </span>
                )}
              </div>
              <span className="text-white/[0.55] break-all leading-relaxed">
                {formatTraceValue(value)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Overflow */}
      {overflow > 0 && (
        <div className="px-2.5 py-1 border-t border-white/[0.04]">
          <span className="text-[9px] text-white/25">+{overflow} more variable{overflow !== 1 ? 's' : ''}</span>
        </div>
      )}
    </div>
  );
};

export default VariableSnapshotInspector;
