import type { ComplexityVisualItem, PatternVisualItem } from '../../types/visualizer';
import Panel from '../common/Panel';
import ComplexityVisualCard from './ComplexityVisualCard';
import PatternVisualGrid from './PatternVisualGrid';

type Props = {
  complexityItems: ComplexityVisualItem[];
  patterns: PatternVisualItem[];
};

const ComplexityLensPanel = ({ complexityItems, patterns }: Props) => {
  return (
    <Panel className="p-6 flex flex-col gap-6">
      {/* Panel header */}
      <div className="flex flex-col gap-1">
        <p className="text-[10px] font-bold tracking-widest uppercase text-indigo-400">
          Complexity Lens
        </p>
        <p className="text-xs text-white/40 leading-relaxed max-w-lg">
          Estimated growth behaviour based on CodeMind's current rule-based analyser.
        </p>
      </div>

      {/* Complexity metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {complexityItems.map((item) => (
          <ComplexityVisualCard key={item.label} item={item} />
        ))}
      </div>

      {/* Detected patterns */}
      <div className="flex flex-col gap-3">
        <p className="text-[10px] font-semibold tracking-widest uppercase text-white/30">
          Detected Patterns
        </p>
        <PatternVisualGrid patterns={patterns} />
      </div>

      {/* Disclaimer note */}
      <p className="text-[10px] text-white/20 leading-relaxed border-t border-white/[0.05] pt-4">
        ⓘ This is an estimated static analysis, not runtime execution tracing. Results reflect
        CodeMind's pattern-matching heuristics and may not capture all code paths.
      </p>
    </Panel>
  );
};

export default ComplexityLensPanel;
