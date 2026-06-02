import React from 'react';
import Panel from '../common/Panel';

const AnalyzerEmptyState: React.FC = () => {
  return (
    <Panel className="p-10 flex flex-col items-center justify-center text-center h-full min-h-[300px]">
      <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10">
        <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
      <h3 className="text-base font-semibold text-white mb-2">No analysis selected</h3>
      <p className="text-sm text-white/40 max-w-sm">
        Submit JavaScript code to generate the first CodeMind report.
      </p>
    </Panel>
  );
};

export default AnalyzerEmptyState;
