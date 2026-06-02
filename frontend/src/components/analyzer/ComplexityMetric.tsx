import React from 'react';
import Panel from '../common/Panel';

type Props = {
  label: string;
  value: string | null;
  hint?: string;
};

const ComplexityMetric: React.FC<Props> = ({ label, value, hint }) => {
  return (
    <Panel className="p-4 flex flex-col gap-1">
      <span className="text-xs font-semibold text-white/50 uppercase tracking-widest">
        {label}
      </span>
      <span className="text-xl font-bold text-white">
        {value === null ? 'Not available' : value}
      </span>
      {hint && <span className="text-xs text-white/30">{hint}</span>}
    </Panel>
  );
};

export default ComplexityMetric;
