import React, { useState, useEffect } from 'react';
import type { Analysis } from '../../types/analysis';
import TraceStepCard from './TraceStepCard';
import TracePlaybackControls from './TracePlaybackControls';
import Panel from '../common/Panel';
import { getChangedVariableKeys } from '../../utils/traceVariableDiff';
import TraceErrorState from './TraceErrorState';

type Props = { analysis: Analysis };

const STEP_LIMIT = 80;
const PLAYBACK_INTERVAL_MS = 900;

const RuntimeTraceTimeline: React.FC<Props> = ({ analysis }) => {
  const { trace_mode, trace_steps, trace_plan } = analysis;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Slice steps up front
  const allSteps = Array.isArray(trace_steps) ? trace_steps : [];
  const visible = allSteps.slice(0, STEP_LIMIT);
  const overflow = allSteps.length - visible.length;

  // Clamp index when step set changes (e.g. analysis prop swap)
  useEffect(() => {
    setCurrentIndex((i) => Math.min(i, Math.max(0, visible.length - 1)));
    setIsPlaying(false);
  }, [visible.length]);

  // ── Auto-playback loop ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!isPlaying || visible.length === 0) return;

    const id = window.setInterval(() => {
      setCurrentIndex((i) => {
        if (i >= visible.length - 1) {
          setIsPlaying(false);   // reached final step — stop
          return i;
        }
        return i + 1;
      });
    }, PLAYBACK_INTERVAL_MS);

    return () => window.clearInterval(id);
  }, [isPlaying, visible.length]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handlePrevious = () => {
    setIsPlaying(false);
    setCurrentIndex((i) => Math.max(0, i - 1));
  };

  const handleNext = () => {
    setIsPlaying(false);
    setCurrentIndex((i) => Math.min(visible.length - 1, i + 1));
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentIndex(0);
  };

  const handleTogglePlay = () => {
    if (visible.length === 0) return;
    // If at final step and not playing, restart from beginning
    if (!isPlaying && currentIndex >= visible.length - 1) {
      setCurrentIndex(0);
      setIsPlaying(true);
      return;
    }
    setIsPlaying((p) => !p);
  };

  // ── Not executed ──────────────────────────────────────────────────────────
  if (trace_mode !== 'executed') {
    const isPlanned = trace_mode === 'planned';
    const isError = trace_mode === 'error';

    return (
      <Panel className="p-5 flex flex-col gap-4">
        <div>
          <p className="text-[10px] font-semibold tracking-widest uppercase text-white/30 mb-3">
            Execution Timeline
          </p>
          {!isError && (
            <p className="text-xs text-white/40 leading-relaxed">
              {isPlanned && trace_plan
                ? `Step-by-step runtime trace is available after execution succeeds. A trace plan with ${trace_plan.steps.length} planned step${trace_plan.steps.length !== 1 ? 's' : ''} exists, but runtime steps require execution to be enabled.`
                : 'Step-by-step runtime trace is available after execution succeeds.'}
            </p>
          )}
        </div>

        {isError && (
          <div className="flex flex-col gap-4">
            <TraceErrorState error={analysis.trace_error} />
            {visible.length > 0 && (
              <div className="mt-2">
                <p className="text-[9px] font-semibold tracking-widest uppercase text-white/30 mb-2">
                  Trace Stopped At Step {visible[visible.length - 1].step}
                </p>
                <TraceStepCard
                  step={{
                    ...visible[visible.length - 1],
                    callStack: [] // Safety: do not render raw stack traces
                  }}
                  isActive={false}
                />
              </div>
            )}
          </div>
        )}
      </Panel>
    );
  }

  // ── Executed but no steps ─────────────────────────────────────────────────
  if (visible.length === 0) {
    return (
      <Panel className="p-5">
        <p className="text-[10px] font-semibold tracking-widest uppercase text-white/30 mb-3">
          Execution Timeline
        </p>
        <p className="text-xs text-white/40">No runtime trace steps are available.</p>
      </Panel>
    );
  }

  const activeStep = visible[currentIndex];

  return (
    <Panel className="p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <p className="text-[10px] font-semibold tracking-widest uppercase text-white/30 mb-0.5">
            Execution Timeline
          </p>
          <p className="text-xs text-white/35">Follow how values changed step by step.</p>
        </div>
        <span className="text-xs font-semibold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-full">
          {allSteps.length} step{allSteps.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Playback controls + legend */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <TracePlaybackControls
          currentIndex={currentIndex}
          totalSteps={visible.length}
          isPlaying={isPlaying}
          atEnd={currentIndex >= visible.length - 1}
          onPrevious={handlePrevious}
          onNext={handleNext}
          onReset={handleReset}
          onTogglePlay={handleTogglePlay}
        />
        <span className="text-[9px] text-white/25 flex items-center gap-1">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400/60" />
          Changed variables highlighted
        </span>
      </div>

      {/* Active step focus */}
      {activeStep && (() => {
        const prevStep = currentIndex > 0 ? visible[currentIndex - 1] : null;
        const focusChangedKeys = getChangedVariableKeys(prevStep?.variables, activeStep.variables);
        return (
          <div>
            <p className="text-[9px] font-semibold tracking-widest uppercase text-white/25 mb-1.5">
              Current Step
            </p>
            <TraceStepCard step={activeStep} isActive changedVariableKeys={focusChangedKeys} />
          </div>
        );
      })()}

      {/* Full timeline list */}
      <div className="flex flex-col gap-1.5">
        {visible.map((step, idx) => {
          const prevStep = idx > 0 ? visible[idx - 1] : null;
          const changedVariableKeys = getChangedVariableKeys(prevStep?.variables, step.variables);
          return (
            <TraceStepCard
              key={step.step}
              step={step}
              isActive={idx === currentIndex}
              onSelect={() => { setIsPlaying(false); setCurrentIndex(idx); }}
              changedVariableKeys={changedVariableKeys}
            />
          );
        })}
      </div>

      {overflow > 0 && (
        <p className="text-[10px] text-white/30 text-center">
          Showing first {STEP_LIMIT} of {allSteps.length} steps.
        </p>
      )}
    </Panel>
  );
};

export default RuntimeTraceTimeline;
