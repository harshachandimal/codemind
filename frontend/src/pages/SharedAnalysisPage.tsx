import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Analysis } from '../types/analysis';
import { getSharedAnalysis } from '../services/analysisService';
import PageShell from '../components/common/PageShell';
import AnalysisResultPanel from '../components/analyzer/AnalysisResultPanel';

const SharedAnalysisPage: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setError('Invalid share link.');
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    getSharedAnalysis(token)
      .then((data) => {
        if (!cancelled) setAnalysis(data);
      })
      .catch(() => {
        if (!cancelled) {
          setError('This shared analysis link is invalid, expired, or revoked.');
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => { cancelled = true; };
  }, [token]);

  return (
    <PageShell>
      <div className="w-full max-w-4xl mx-auto px-6 py-12 flex flex-col gap-6">

        {/* Page header */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {analysis?.title ?? 'Shared Analysis'}
            </h1>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2.5 py-1 rounded-full w-fit">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
              Read-only shared analysis
            </span>
          </div>
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center gap-3 text-white/50 text-sm py-16 justify-center">
            <svg className="animate-spin h-4 w-4 text-indigo-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Loading shared analysis…
          </div>
        )}

        {/* Error state */}
        {!isLoading && error && (
          <div className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-white/70 text-sm font-medium max-w-xs">{error}</p>
          </div>
        )}

        {/* Analysis content */}
        {!isLoading && !error && analysis && (
          <AnalysisResultPanel analysis={analysis} readOnly />
        )}

        {/* Footer CTA */}
        {!isLoading && (
          <p className="text-center text-xs text-white/30 mt-4">
            Want to analyse your own code?{' '}
            <Link to="/analyzer" className="text-indigo-400 hover:text-indigo-300 transition-colors underline underline-offset-2">
              Create your own analysis with CodeMind
            </Link>
          </p>
        )}

      </div>
    </PageShell>
  );
};

export default SharedAnalysisPage;
