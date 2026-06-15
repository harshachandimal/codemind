import React, { useMemo } from 'react';
import { normalizeTraceSteps } from '../../utils/traceStepAdapter';
import { useTracePlayback } from '../../hooks/useTracePlayback';
import { TracePlaybackControls } from './TracePlaybackControls';
import { TraceTimeline } from './TraceTimeline';
import { TraceStepDetails } from './TraceStepDetails';
import { TraceVariablesPanel } from './TraceVariablesPanel';
import { TraceCallStackPanel } from './TraceCallStackPanel';

type Props = {
  rawSteps?: unknown[] | null;
  language?: string;
};

export const RuntimeTracePlayer: React.FC<Props> = ({ rawSteps, language }) => {
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

  if (!steps || steps.length === 0) {
    return (
      <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-8 text-center mt-6">
        <p className="text-slate-400">Runtime trace is not available for this analysis.</p>
      </div>
    );
  }

  return (
    <div className="mt-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-100">
          Runtime Trace Player {language && <span className="text-slate-500 text-sm font-normal ml-2 capitalize">({language})</span>}
        </h2>
        <div className="text-sm text-slate-400">
          Step {currentIndex + 1} of {steps.length}
        </div>
      </div>

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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Left Column: Timeline */}
        <div className="lg:col-span-1 flex flex-col min-h-[300px] max-h-[500px]">
          <TraceTimeline
            steps={steps}
            currentIndex={currentIndex}
            onSelectStep={(index) => {
              if (isPlaying) pause();
              jumpTo(index);
            }}
          />
        </div>

        {/* Middle Column: Step Details */}
        <div className="lg:col-span-2 flex flex-col min-h-[300px]">
          <TraceStepDetails step={currentStep} />
        </div>

        {/* Right Column: Variables & Call Stack */}
        <div className="lg:col-span-1 flex flex-col gap-4 min-h-[300px] max-h-[500px]">
          <div className="flex-1 overflow-hidden">
            <TraceVariablesPanel variables={currentStep?.variables} />
          </div>
          <div className="flex-1 overflow-hidden">
            <TraceCallStackPanel callStack={currentStep?.callStack} />
          </div>
        </div>
      </div>
    </div>
  );
};
