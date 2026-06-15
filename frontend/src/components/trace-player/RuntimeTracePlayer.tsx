import React, { useMemo } from 'react';
import { normalizeTraceSteps } from '../../utils/traceStepAdapter';
import { useTracePlayback } from '../../hooks/useTracePlayback';
import { TracePlaybackControls } from './TracePlaybackControls';
import { TraceTimeline } from './TraceTimeline';
import { TraceStepDetails } from './TraceStepDetails';
import { RuntimeStatePanel } from './RuntimeStatePanel';

import { TracePlayerStep } from '../../types/tracePlayer';

type Props = {
  rawSteps?: unknown[] | null;
  language?: string;
  onStepChange?: (step: TracePlayerStep | null) => void;
  runtimeError?: unknown;
  warnings?: string[];
};

export const RuntimeTracePlayer: React.FC<Props> = ({ rawSteps, language, onStepChange, runtimeError, warnings }) => {
  const steps = useMemo(() => normalizeTraceSteps(rawSteps || []), [rawSteps]);

  const {
    currentStep,
    currentIndex,
    isPlaying,
    speedMs,
    canGoNext,
    canGoPrevious,
    pause,
    togglePlay,
    next,
    previous,
    reset,
    jumpTo,
    setSpeedMs,
  } = useTracePlayback(steps);

  React.useEffect(() => {
    if (onStepChange) {
      onStepChange(currentStep || null);
    }
  }, [currentStep, onStepChange]);

  if (!steps || steps.length === 0) {
    return (
      <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-8 text-center mt-6 flex flex-col gap-4">
        <p className="text-slate-400">Runtime trace is not available for this analysis.</p>
        {(runtimeError || (warnings && warnings.length > 0)) && (
          <div className="max-w-xl mx-auto text-left w-full mt-4">
            <RuntimeStatePanel 
              allSteps={steps} 
              runtimeError={runtimeError} 
              warnings={warnings} 
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-950/50">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-slate-800/60">
        <h2 className="text-base font-bold text-slate-100">
          Runtime Trace Player
          {language && <span className="text-slate-500 text-xs font-normal ml-2 capitalize">({language})</span>}
        </h2>
        <div className="text-xs text-slate-400 font-mono tabular-nums">
          Step {currentIndex + 1} / {steps.length}
        </div>
      </header>

      {/* Controls */}
      <div className="px-4 py-2 border-b border-slate-800/60 bg-slate-900/20">
        <TracePlaybackControls
          isPlaying={isPlaying}
          canGoNext={canGoNext}
          canGoPrevious={canGoPrevious}
          speedMs={speedMs}
          onPlayPause={togglePlay}
          onNext={next}
          onPrevious={previous}
          onReset={reset}
          onSpeedChange={setSpeedMs}
        />
      </div>

      {/*
        Body layout strategy:
        - Mobile/tablet (< xl): single column, stacked
        - xl (~1280px): 2 columns — Timeline | [StepDetails + RuntimeState stacked]
        - 2xl (~1536px): 3 columns — Timeline | StepDetails | RuntimeState
        This prevents the 3-column grid from ever exceeding the available container width.
      */}
      <div className="grid min-w-0 grid-cols-1 gap-3 p-3 xl:grid-cols-[200px_minmax(0,1fr)] 2xl:grid-cols-[200px_minmax(0,1fr)_minmax(0,0.85fr)]">

        {/* Column 1: Timeline — fixed narrow width */}
        <div className="min-w-0">
          <TraceTimeline
            steps={steps}
            currentIndex={currentIndex}
            onSelectStep={(index) => {
              if (isPlaying) pause();
              jumpTo(index);
            }}
          />
        </div>

        {/* Column 2: Step Details — grows to fill */}
        <div className="min-w-0">
          <TraceStepDetails step={currentStep} />
        </div>

        {/* Column 3: Runtime State — spans full width on xl, own column on 2xl */}
        <div className="min-w-0 xl:col-span-2 2xl:col-span-1">
          <RuntimeStatePanel 
            step={currentStep} 
            previousStep={currentIndex > 0 ? steps[currentIndex - 1] : null}
            allSteps={steps}
            runtimeError={runtimeError}
            warnings={warnings}
          />
        </div>
      </div>
    </div>
  );
};
