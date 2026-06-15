import React, { useMemo } from 'react';
import Panel from '../common/Panel';
import { useLanguageCapabilities } from '../../hooks/useLanguageCapabilities';

type Props = {
  title: string;
  sourceCode: string;
  entryFunction: string;
  inputJson: string;
  loading: boolean;
  error: string | null;
  onTitleChange: (v: string) => void;
  onSourceCodeChange: (v: string) => void;
  onEntryFunctionChange: (v: string) => void;
  onInputJsonChange: (v: string) => void;
  onSubmit: () => void;
  editorFontSize?: number;
  language?: string;
  onLanguageChange?: (v: string) => void;
};

const CodeInputPanel: React.FC<Props> = ({
  title, sourceCode, entryFunction, inputJson, loading, error,
  onTitleChange, onSourceCodeChange, onEntryFunctionChange, onInputJsonChange, onSubmit,
  editorFontSize = 14, language = 'javascript', onLanguageChange
}) => {
  const { capabilities } = useLanguageCapabilities();
  const selectedCap = useMemo(() => capabilities.find(c => c.language === language), [capabilities, language]);

  return (
    <Panel className="p-6 flex flex-col h-full gap-4">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold text-white/50 uppercase tracking-widest">Title (Optional)</label>
        <input
          type="text"
          value={title}
          onChange={e => onTitleChange(e.target.value)}
          placeholder="e.g. Array sum function"
          className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
        />
      </div>

      <div className="flex flex-col gap-1 flex-1">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-white/50 uppercase tracking-widest">Source Code</label>
          <div className="flex items-center gap-3">
            {selectedCap && (
              <span className={`text-[10px] ${selectedCap.runtimeTraceEnabled ? 'text-emerald-400/80' : 'text-amber-400/80'}`}>
                {selectedCap.runtimeTraceEnabled
                  ? 'Runtime trace is enabled for this language.'
                  : 'Runtime trace is currently disabled for this language. Static analysis still works.'}
              </span>
            )}
            <select 
              value={language}
              onChange={e => onLanguageChange?.(e.target.value)}
              className="bg-black/20 border border-white/10 rounded-lg px-2 py-1 text-xs text-indigo-400 font-medium focus:outline-none focus:border-indigo-500 transition-colors"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
            </select>
          </div>
        </div>
        <textarea
          value={sourceCode}
          onChange={e => onSourceCodeChange(e.target.value)}
          spellCheck={false}
          style={{ fontSize: `${editorFontSize}px` }}
          className="flex-1 w-full bg-[#0d1117] border border-white/10 rounded-xl p-4 font-mono text-gray-300 focus:outline-none focus:border-indigo-500 transition-colors leading-relaxed min-h-[300px] resize-y"
          placeholder="function sum(arr) { ... }"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-white/50 uppercase tracking-widest">Entry Function (Optional)</label>
          <input
            type="text"
            value={entryFunction}
            onChange={e => onEntryFunctionChange(e.target.value)}
            placeholder="e.g. sum"
            className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-white/50 uppercase tracking-widest">Input Arguments (JSON Array)</label>
          <input
            type="text"
            value={inputJson}
            onChange={e => onInputJsonChange(e.target.value)}
            placeholder="e.g. [[2, 4, 6]]"
            className="bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        onClick={onSubmit}
        disabled={loading || !sourceCode.trim()}
        className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 disabled:hover:bg-indigo-500 text-white font-medium text-sm py-3 rounded-xl transition-colors"
      >
        {loading ? 'Analyzing...' : 'Analyze Code'}
      </button>
    </Panel>
  );
};

export default CodeInputPanel;
