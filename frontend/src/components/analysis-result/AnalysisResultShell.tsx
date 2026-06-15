import React, { useState } from 'react';
import type { Analysis } from '../../types/analysis';
import type { UserSettings } from '../../types/settings';
import AnalyzerEmptyState from '../analyzer/AnalyzerEmptyState';
import AnalysisExportButtons from '../analyzer/AnalysisExportButtons';
import AnalysisShareButton from '../analyzer/AnalysisShareButton';
import StaticAnalysisView from './StaticAnalysisView';
import RuntimeTraceView from './RuntimeTraceView';

type Props = {
  analysis: Analysis | null;
  /** When true, hides owner-only actions (export, share). Use on the public shared page. */
  readOnly?: boolean;
  settings?: UserSettings;
};

type Tab = 'static' | 'runtime';

const AnalysisResultShell: React.FC<Props> = ({ analysis, readOnly = false, settings }) => {
  const [activeTab, setActiveTab] = useState<Tab>('static');

  if (!analysis) return <AnalyzerEmptyState />;

  const isStubbed = analysis.detected_patterns?.includes('stubbed_analysis');

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Report header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">Analysis Report</h2>
          <p className="text-sm text-white/40">
            Status: <span className="text-indigo-400 capitalize">{analysis.status}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isStubbed && (
            <span className="text-[10px] uppercase font-bold px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Stubbed Result
            </span>
          )}
          {!readOnly && (
            <>
              <AnalysisExportButtons analysis={analysis} />
              <AnalysisShareButton analysis={analysis} />
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-px">
        <button
          onClick={() => setActiveTab('static')}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'static'
              ? 'text-indigo-400 border-indigo-500'
              : 'text-slate-400 border-transparent hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          Static Analysis
        </button>
        <button
          onClick={() => setActiveTab('runtime')}
          className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
            activeTab === 'runtime'
              ? 'text-emerald-400 border-emerald-500'
              : 'text-slate-400 border-transparent hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          Runtime Trace
        </button>
      </div>

      {/* Tab Content */}
      <div className="animate-in fade-in duration-300">
        {activeTab === 'static' ? (
          <StaticAnalysisView analysis={analysis} settings={settings} />
        ) : (
          <RuntimeTraceView analysis={analysis} />
        )}
      </div>
    </div>
  );
};

export default AnalysisResultShell;
