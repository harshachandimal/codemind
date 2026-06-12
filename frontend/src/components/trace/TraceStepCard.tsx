import React from 'react';
import type { TraceStep } from '../../types/analysis';
import { getTraceStepLabel, getTraceStepTone, type StepTone } from '../../utils/traceStepLabels';
import VariableSnapshotInspector from './VariableSnapshotInspector';

type Props = {
  step: TraceStep;
  isActive?: boolean;
  onSelect?: () => void;
  changedVariableKeys?: string[];
};

const TONE_CLASSES: Record<StepTone, { badge: string; number: string; border: string }> = {
  success: {
    badge:  'bg-emerald-500/15 text-emerald-300 border-emerald-500/20',
    number: 'text-emerald-400',
    border: 'border-emerald-500/20',
  },
  info: {
    badge:  'bg-indigo-500/15 text-indigo-300 border-indigo-500/20',
    number: 'text-indigo-400',
    border: 'border-indigo-500/20',
  },
  warning: {
    badge:  'bg-amber-500/15 text-amber-300 border-amber-500/20',
    number: 'text-amber-400',
    border: 'border-amber-500/20',
  },
  danger: {
    badge:  'bg-red-500/15 text-red-300 border-red-500/20',
    number: 'text-red-400',
    border: 'border-red-500/20',
  },
  neutral: {
    badge:  'bg-white/[0.06] text-white/50 border-white/10',
    number: 'text-white/35',
    border: 'border-white/[0.06]',
  },
};

const TraceStepCard: React.FC<Props> = ({ step, isActive = false, onSelect, changedVariableKeys = [] }) => {
  const tone = getTraceStepTone(step.type);
  const cls = TONE_CLASSES[tone];

  const activeRing = isActive
    ? 'ring-1 ring-indigo-500/50 bg-indigo-500/[0.05] border-indigo-500/40'
    : '';

  return (
    <div
      className={['rounded-xl border bg-white/[0.025] p-3.5 flex gap-3 transition-all', cls.border, activeRing, onSelect ? 'cursor-pointer' : ''].join(' ')}
      onClick={onSelect}
      onKeyDown={onSelect ? (e) => { if (e.key === 'Enter' || e.key === ' ') onSelect(); } : undefined}
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
    >
      {/* Step number column */}
      <div className="flex flex-col items-center gap-1 pt-0.5 shrink-0">
        <span className={['text-xs font-bold font-mono tabular-nums', cls.number].join(' ')}>
          {step.step}
        </span>
        <div className="w-px flex-1 bg-white/[0.06]" />
      </div>

      {/* Content */}
      <div className="flex flex-col gap-1.5 min-w-0 flex-1">
        {/* Type badge + line */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className={['text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border', cls.badge].join(' ')}>
            {getTraceStepLabel(step.type)}
          </span>
          {step.line !== null && step.line !== undefined && (
            <span className="text-[10px] text-white/30 font-mono">line {step.line}</span>
          )}
        </div>

        {/* Description */}
        <p className="text-xs text-white/70 leading-relaxed">{step.description}</p>

        {/* Call stack */}
        {step.callStack && step.callStack.length > 0 && (
          <p className="text-[10px] text-white/35 font-mono">
            Stack: {step.callStack.join(' → ')}
          </p>
        )}

        {/* Variables */}
        <VariableSnapshotInspector variables={step.variables} highlightedKeys={changedVariableKeys} />
      </div>
    </div>
  );
};

export default TraceStepCard;
