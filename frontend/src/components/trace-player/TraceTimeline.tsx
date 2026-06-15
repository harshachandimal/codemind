import React, { useRef, useEffect } from 'react';
import { TracePlayerStep } from '../../types/tracePlayer';

type Props = {
  steps: TracePlayerStep[];
  currentIndex: number;
  onSelectStep: (index: number) => void;
};

export const TraceTimeline: React.FC<Props> = ({ steps, currentIndex, onSelectStep }) => {
  const activeStepRef = useRef<HTMLButtonElement>(null);

  // Scroll active step into view whenever currentIndex changes
  useEffect(() => {
    if (activeStepRef.current) {
      activeStepRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [currentIndex]);

  return (
    <div className="min-h-[280px] max-h-[520px] overflow-y-auto overflow-x-hidden custom-scrollbar bg-slate-900/40 rounded-lg border border-slate-800 p-1.5">
      <div className="flex flex-col gap-0.5">
        {steps.map((step, index) => {
          const isActive = index === currentIndex;
          const isPast = index < currentIndex;

          return (
            <button
              key={step.id}
              ref={(el) => {
                if (isActive && el) {
                  activeStepRef.current = el;
                }
              }}
              onClick={() => onSelectStep(index)}
              title={step.description ? `${step.title}\n${step.description}` : step.title}
              className={`group flex items-center gap-1.5 text-left px-2 py-2 rounded transition-all w-full min-w-0 ${
                isActive
                  ? 'bg-indigo-600/20 border border-indigo-500/50'
                  : isPast
                    ? 'border border-transparent hover:bg-slate-800/70'
                    : 'border border-transparent hover:bg-slate-800/50'
              }`}
            >
              {/* Step number */}
              <span className={`text-[10px] font-mono w-5 shrink-0 text-right ${isActive ? 'text-indigo-400 font-bold' : 'text-slate-600'}`}>
                {index + 1}
              </span>

              {/* Step title — truncates gracefully */}
              <span className={`flex-1 text-xs truncate min-w-0 ${isActive ? 'text-indigo-100 font-semibold' : (isPast ? 'text-slate-300' : 'text-slate-500')}`}>
                {step.title}
              </span>

              {/* Type badge — very compact */}
              <span className={`text-[9px] px-1 py-px rounded shrink-0 font-mono uppercase tracking-wide border ${
                isActive
                  ? 'bg-indigo-500/30 text-indigo-300 border-indigo-500/30'
                  : 'bg-slate-800 text-slate-600 border-slate-700/60'
              }`}>
                {step.type.replace(/_/g, ' ')}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
