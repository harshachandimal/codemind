import type { PatternVisualItem } from '../../types/visualizer';
import PatternVisualCard from './PatternVisualCard';

type Props = { patterns: PatternVisualItem[] };

const PatternVisualGrid = ({ patterns }: Props) => {
  if (patterns.length === 0) {
    return (
      <p className="text-xs text-white/30 italic">
        No detected patterns available for this analysis.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {patterns.map((pattern) => (
        <PatternVisualCard key={pattern.key} pattern={pattern} />
      ))}
    </div>
  );
};

export default PatternVisualGrid;
