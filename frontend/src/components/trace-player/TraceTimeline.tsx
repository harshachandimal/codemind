import React, { useRef, useEffect } from 'react';
import { TracePlayerStep } from '../../types/tracePlayer';

type Props = {
  steps: TracePlayerStep[];
  currentIndex: number;
  onSelectStep: (index: number) => void;
};

export const TraceTimeline: React.FC<Props> = ({ steps, currentIndex, onSelectStep }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeStepRef = useRef<HTMLButtonElement>(null);

  // Scroll active step into view
  useEffect(() => {
    if (activeStepRef.current && containerRef.current) {
      const container = containerRef.current;
      const element = activeStepRef.current;
      
      const containerScrollTop = container.scrollTop;
      const containerHeight = container.clientHeight;
      const elementTop = element.offsetTop;
      const elementHeight = element.clientHeight;
      
      if (elementTop < containerScrollTop || elementTop + elementHeight > containerScrollTop + containerHeight) {
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [currentIndex]);

  return (
    <div 
      ref={containerRef}
      className="max-h-64 overflow-y-auto pr-2 custom-scrollbar bg-slate-900/40 rounded-lg border border-slate-800"
    >
      <div className="flex flex-col p-2 space-y-1">
        {steps.map((step, index) => {
          const isActive = index === currentIndex;
          const isPast = index < currentIndex;
          
          return (
            <button
              key={step.id}
              ref={isActive ? activeStepRef : null}
              onClick={() => onSelectStep(index)}
              className={`flex items-center text-left px-3 py-2 rounded transition-colors ${
                isActive 
                  ? 'bg-indigo-600/20 border border-indigo-500/50 text-indigo-100' 
                  : isPast
                    ? 'bg-transparent text-slate-400 hover:bg-slate-800'
                    : 'bg-transparent text-slate-500 hover:bg-slate-800'
              }`}
            >
              <span className={`text-xs font-mono w-8 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`}>
                {index + 1}.
              </span>
              <span className="flex-1 text-sm font-medium truncate ml-2">
                {step.title}
              </span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded ml-2 uppercase font-mono ${
                isActive ? 'bg-indigo-500/30 text-indigo-300' : 'bg-slate-800 text-slate-500'
              }`}>
                {step.type}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
