import React from 'react';
import type { TraceError } from '../../types/analysis';
import { getTraceErrorPresentation } from '../../utils/traceErrorMessages';

type Props = {
  error: TraceError | null | undefined;
};

const TONE_CLASSES = {
  info: {
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/20',
    title: 'text-indigo-300',
    icon: 'text-indigo-400',
  },
  warning: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    title: 'text-amber-300',
    icon: 'text-amber-400',
  },
  danger: {
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    title: 'text-red-300',
    icon: 'text-red-400',
  },
  neutral: {
    bg: 'bg-white/[0.04]',
    border: 'border-white/10',
    title: 'text-white/70',
    icon: 'text-white/40',
  },
};

const TraceErrorState: React.FC<Props> = ({ error }) => {
  const presentation = getTraceErrorPresentation(error?.code, error?.message);
  const cls = TONE_CLASSES[presentation.tone];

  return (
    <div className={['rounded-xl border p-5 flex flex-col gap-3', cls.bg, cls.border].join(' ')}>
      <div className="flex items-start gap-3">
        {/* Icon placeholder (simple CSS circle for now) */}
        <div className={['shrink-0 w-5 h-5 rounded-full flex items-center justify-center border border-current mt-0.5', cls.icon].join(' ')}>
          <span className="text-[10px] font-bold">!</span>
        </div>

        <div className="flex flex-col gap-1.5 flex-1">
          <h4 className={['text-sm font-semibold', cls.title].join(' ')}>
            {presentation.title}
          </h4>
          <p className="text-xs text-white/60 leading-relaxed">
            {presentation.description}
          </p>
          <p className="text-xs text-white/50 leading-relaxed italic mt-1">
            {presentation.suggestion}
          </p>

          {/* Optional Code Badge */}
          {error?.code && (
            <div className="mt-2">
              <span className="inline-block px-2 py-1 rounded bg-black/30 border border-white/5 text-[10px] font-mono text-white/40">
                {error.code}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TraceErrorState;
