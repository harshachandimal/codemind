import React, { useRef, useEffect } from 'react';

type Props = {
  sourceCode: string;
  language: string;
  entryFunction?: string | null;
  input?: unknown[];
  activeLine?: number | null;
};

const SourceCodePanel: React.FC<Props> = ({ sourceCode, language, entryFunction, input, activeLine }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLDivElement>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(sourceCode);
  };

  useEffect(() => {
    if (activeLineRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const element = activeLineRef.current;
      
      const elementTop = element.offsetTop;
      const elementBottom = elementTop + element.clientHeight;
      const containerTop = container.scrollTop;
      const containerBottom = containerTop + container.clientHeight;
      
      // Add a small buffer so the line doesn't sit exactly at the edge
      const buffer = 40;
      
      if (elementTop < containerTop + buffer) {
        container.scrollTo({ top: Math.max(0, elementTop - buffer), behavior: 'smooth' });
      } else if (elementBottom > containerBottom - buffer) {
        container.scrollTo({ top: elementBottom - container.clientHeight + buffer, behavior: 'smooth' });
      }
    }
  }, [activeLine]);

  const lines = sourceCode.split('\n');

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl flex flex-col h-full max-h-[calc(100vh-220px)]">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
        <h3 className="text-sm font-bold text-slate-100 uppercase tracking-widest flex items-center gap-2">
          Analyzed Source
          <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded capitalize">
            {language}
          </span>
        </h3>
        <button
          onClick={handleCopy}
          className="text-slate-400 hover:text-slate-200 transition-colors"
          title="Copy Source Code"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
      </div>

      {(entryFunction || input !== undefined) && (
        <div className="px-4 py-3 border-b border-slate-800 bg-black/20 flex flex-col gap-2">
          {entryFunction && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500">Entry Function:</span>
              <code className="text-indigo-400 font-mono">{entryFunction}</code>
            </div>
          )}
          {input !== undefined && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500">Input:</span>
              <code className="text-emerald-400 font-mono">{JSON.stringify(input)}</code>
            </div>
          )}
        </div>
      )}

      {activeLine === null && (
        <div className="px-4 py-2 bg-slate-900/40 border-b border-slate-800 flex items-center gap-2">
          <svg className="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-[11px] text-slate-500 font-medium">
            Line highlighting is unavailable for this trace.
          </span>
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-auto p-4 custom-scrollbar">
        <div className="font-mono text-sm leading-relaxed whitespace-pre">
          {lines.map((lineText, idx) => {
            const lineNum = idx + 1;
            const isActive = lineNum === activeLine;
            
            return (
              <div 
                key={idx} 
                ref={isActive ? activeLineRef : null}
                className={`flex w-full group ${isActive ? 'bg-indigo-500/20 border-l-2 border-indigo-400' : 'border-l-2 border-transparent hover:bg-white/5'}`}
              >
                <div className={`w-10 text-right pr-4 select-none ${isActive ? 'text-indigo-300' : 'text-slate-600'}`}>
                  {lineNum}
                </div>
                <div className={`flex-1 pr-4 ${isActive ? 'text-slate-100' : 'text-slate-300'}`}>
                  {lineText || ' '}
                  {isActive && (
                    <span className="ml-4 inline-block align-middle text-[10px] bg-indigo-500/30 text-indigo-200 px-2 rounded-full font-sans tracking-wide">
                      Current Step
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SourceCodePanel;
