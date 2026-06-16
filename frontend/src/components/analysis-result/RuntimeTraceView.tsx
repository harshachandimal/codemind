import React, { useState } from 'react';
import type { Analysis } from '../../types/analysis';
import SourceCodePanel from './SourceCodePanel';
import { RuntimeTraceWorkspace } from './RuntimeTraceWorkspace';
import { TracePlayerStep } from '../../types/tracePlayer';

type Props = {
  analysis: Analysis;
};

const RuntimeTraceView: React.FC<Props> = ({ analysis }) => {
  const [currentStep, setCurrentStep] = useState<TracePlayerStep | null>(null);

  return (
    /*
      Split layout:
      - Mobile: stacked
      - xl: source panel fixed ~400px, trace workspace gets all remaining space
      - Source panel is capped so trace player is never starved of width
    */
    <section className="grid grid-cols-1 gap-6 xl:grid-cols-[380px_minmax(0,1fr)] 2xl:grid-cols-[420px_minmax(0,1fr)]">
      <div className="min-w-0">
        <SourceCodePanel 
          sourceCode={analysis.source_code} 
          language={analysis.language} 
          entryFunction={analysis.trace_metadata?.entryFunction}
          input={undefined}
          activeLine={currentStep?.lineNumber ?? null}
        />
      </div>
      <div className="min-w-0 flex flex-col">
        <RuntimeTraceWorkspace 
          analysis={analysis} 
          onStepChange={setCurrentStep}
        />
      </div>
    </section>
  );
};

export default RuntimeTraceView;
