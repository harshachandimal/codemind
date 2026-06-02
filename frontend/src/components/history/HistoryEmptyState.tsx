import React from 'react';
import { Link } from 'react-router-dom';
import Panel from '../common/Panel';

const HistoryEmptyState: React.FC = () => {
  return (
    <Panel className="p-12 flex flex-col items-center justify-center text-center max-w-lg mx-auto mt-12">
      <div className="w-14 h-14 rounded-full bg-indigo-500/10 flex items-center justify-center mb-5 border border-indigo-500/20">
        <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </div>
      <h3 className="text-lg font-bold text-white mb-2">No analyses yet</h3>
      <p className="text-sm text-white/50 mb-8 max-w-sm">
        Submit code in the Analyzer to create your first report. Your history will appear here.
      </p>
      <Link
        to="/analyzer"
        className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium text-sm px-6 py-2.5 rounded-lg transition-colors"
      >
        Open Analyzer
      </Link>
    </Panel>
  );
};

export default HistoryEmptyState;
