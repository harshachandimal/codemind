import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import PageShell from '../components/common/PageShell';
import SourceCodePanel from '../components/analysis-result/SourceCodePanel';
import { RuntimeTraceWorkspace } from '../components/analysis-result/RuntimeTraceWorkspace';
import { TracePlayerStep } from '../types/tracePlayer';
import { Analysis } from '../types/analysis';
import { getAnalysis, runAnalysisRuntimeTrace } from '../services/analysisService';

const RuntimeTraceFullPage: React.FC = () => {
  const { analysisId } = useParams<{ analysisId: string }>();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRunningTrace, setIsRunningTrace] = useState(false);
  const [currentStep, setCurrentStep] = useState<TracePlayerStep | null>(null);

  useEffect(() => {
    if (!analysisId) return;
    fetchAnalysis(parseInt(analysisId, 10));
  }, [analysisId]);

  const fetchAnalysis = async (id: number) => {
    try {
      const res = await getAnalysis(id);
      if (res.data?.analysis) {
        setAnalysis(res.data.analysis);
      } else {
        setError('Analysis not found.');
      }
    } catch (err) {
      setError('Could not fetch analysis. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRunTrace = async (entryFunction: string | null, input: unknown[]) => {
    if (!analysis) return;
    setIsRunningTrace(true);
    try {
      const response = await runAnalysisRuntimeTrace(analysis.id, { entryFunction, input });
      if (response.success && response.data?.analysis) {
        setAnalysis(response.data.analysis);
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to run trace. Please try again.');
    } finally {
      setIsRunningTrace(false);
    }
  };

  if (loading) {
    return (
      <PageShell>
        <div className="w-full h-[calc(100vh-8rem)] flex items-center justify-center">
          <p className="text-white/50">Loading trace workspace...</p>
        </div>
      </PageShell>
    );
  }

  if (error || !analysis) {
    return (
      <PageShell>
        <div className="w-full h-[calc(100vh-8rem)] flex flex-col items-center justify-center gap-4">
          <p className="text-rose-400">{error || 'Analysis not found'}</p>
          <Link to="/history" className="text-indigo-400 hover:text-indigo-300">
            &larr; Back to History
          </Link>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      {/* Top Bar */}
      <div className="w-full bg-slate-900 border-b border-slate-800">
        <div className="mx-auto w-full max-w-[1700px] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/history"
              className="text-sm font-medium text-white/50 hover:text-white flex items-center gap-2 transition-colors"
            >
              &larr; Back to History
            </Link>
            <div className="h-4 w-px bg-slate-800 hidden md:block"></div>
            <h1 className="text-sm font-bold text-white hidden md:block">
              {analysis.title || 'Untitled analysis'}
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[10px] font-bold text-slate-300 uppercase tracking-widest hidden md:block">
              {analysis.language}
            </span>
          </div>
          <div>
            <span className="text-xs text-white/40">Status: <span className="text-indigo-400 capitalize">{analysis.status}</span></span>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="mx-auto grid w-full max-w-[1700px] grid-cols-1 gap-6 px-6 py-6 2xl:grid-cols-[minmax(420px,520px)_minmax(0,1fr)]">
        
        {/* Source Code Panel */}
        <div className="min-w-0 flex flex-col max-h-[calc(100vh-12rem)]">
          <SourceCodePanel
            sourceCode={analysis.source_code}
            language={analysis.language}
            entryFunction={analysis.trace_metadata?.entryFunction}
            input={undefined}
            activeLine={currentStep?.lineNumber ?? null}
          />
        </div>

        {/* Trace Player / Run Form */}
        <div className="min-w-0 flex flex-col">
          <RuntimeTraceWorkspace
            analysis={analysis}
            onStepChange={setCurrentStep}
            onRunTrace={handleRunTrace}
            isRunningTrace={isRunningTrace}
          />
        </div>

      </div>
    </PageShell>
  );
};

export default RuntimeTraceFullPage;
