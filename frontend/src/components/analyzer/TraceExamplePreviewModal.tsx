import React, { useEffect } from 'react';
import type { TraceExample } from '../../constants/traceExamples';
import { formatTraceValue } from '../../utils/formatTraceValue';

type TraceExamplePreviewModalProps = {
  example: TraceExample | null;
  isOpen: boolean;
  onClose: () => void;
  onLoadExample: (example: TraceExample) => void;
  onRunExample?: (example: TraceExample) => void;
};

const categoryColors: Record<string, string> = {
  basics: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  branches: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  loops: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  arrays: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  recursion: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
};

const TraceExamplePreviewModal: React.FC<TraceExamplePreviewModalProps> = ({
  example,
  isOpen,
  onClose,
  onLoadExample,
  onRunExample,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !example) return null;

  let inputStr = '';
  try {
    inputStr = JSON.stringify(example.input, null, 2);
  } catch (err) {
    inputStr = '[unable to display input]';
  }

  let expectedStr = '';
  if (example.expectedResult !== undefined) {
    try {
      expectedStr = formatTraceValue ? formatTraceValue(example.expectedResult) : JSON.stringify(example.expectedResult, null, 2);
    } catch (err) {
      expectedStr = '[unable to display result]';
    }
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div 
        className="bg-[#0d1117] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b border-white/10 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-bold text-white">{example.title}</h2>
              <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${categoryColors[example.category] || 'bg-white/10 text-white border-white/20'}`}>
                {example.category}
              </span>
            </div>
            <p className="text-sm text-white/50">{example.description}</p>
          </div>
          <button onClick={onClose} className="p-2 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors">
            ✕
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex flex-col gap-6 flex-1">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-white/50 uppercase tracking-widest">Source Code</span>
            <pre className="bg-black/40 border border-white/5 rounded-xl p-4 text-sm font-mono text-gray-300 overflow-x-auto">
              {example.sourceCode}
            </pre>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-white/50 uppercase tracking-widest">Entry Function</span>
              <div className="bg-black/20 border border-white/5 rounded-lg px-3 py-2 text-sm font-mono text-indigo-400">
                {example.entryFunction}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-white/50 uppercase tracking-widest">Input Arguments</span>
              <pre className="bg-black/20 border border-white/5 rounded-lg px-3 py-2 text-sm font-mono text-white overflow-x-auto">
                {inputStr}
              </pre>
            </div>
          </div>

          {(example.expectedResult !== undefined || (example.learningPoints && example.learningPoints.length > 0)) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-indigo-500/5 border border-indigo-500/10 rounded-xl p-4">
              {example.expectedResult !== undefined && (
                <div className="flex flex-col gap-2">
                  <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">Expected Result</span>
                  <pre className="text-sm font-mono text-white">
                    {expectedStr}
                  </pre>
                </div>
              )}
              
              {example.learningPoints && example.learningPoints.length > 0 && (
                <div className="flex flex-col gap-2 sm:col-span-1">
                  <span className="text-xs font-semibold text-indigo-400 uppercase tracking-widest">Learning Points</span>
                  <ul className="list-disc list-inside text-sm text-white/70 space-y-1">
                    {example.learningPoints.map((pt, i) => (
                      <li key={i}>{pt}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-white/10 flex justify-end gap-3 bg-black/20">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
            Cancel
          </button>
          <button 
            onClick={() => {
              onLoadExample(example);
              onClose();
            }} 
            className="px-4 py-2 text-sm font-medium text-white bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
          >
            Load Example
          </button>
          {onRunExample && (
            <button 
              onClick={() => {
                onRunExample(example);
                onClose();
              }} 
              className="px-6 py-2 text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-600 rounded-xl transition-colors shadow-lg shadow-indigo-500/20 flex items-center gap-2"
            >
              Run Example
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TraceExamplePreviewModal;
