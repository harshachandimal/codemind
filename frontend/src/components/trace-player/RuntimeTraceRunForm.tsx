import React, { useState } from 'react';

type Props = {
  language: string;
  defaultEntryFunction?: string | null;
  defaultInput?: unknown[] | null;
  isRunning: boolean;
  onRun: (entryFunction: string | null, input: unknown[]) => void;
};

export const RuntimeTraceRunForm: React.FC<Props> = ({
  language,
  defaultEntryFunction,
  defaultInput,
  isRunning,
  onRun,
}) => {
  const needsEntryFunction = ['python', 'java'].includes(language);
  const [entryFunction, setEntryFunction] = useState(defaultEntryFunction || '');
  const [inputJson, setInputJson] = useState(defaultInput ? JSON.stringify(defaultInput, null, 2) : '[]');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (needsEntryFunction && !entryFunction.trim()) {
      setError('Entry function is required for this language.');
      return;
    }

    let parsedInput: unknown[];
    try {
      parsedInput = JSON.parse(inputJson || '[]');
      if (!Array.isArray(parsedInput)) {
        throw new Error('Input must be a JSON array.');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid JSON format for input parameters.');
      return;
    }

    onRun(entryFunction.trim() || null, parsedInput);
  };

  return (
    <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-6">
      <h3 className="text-sm font-semibold text-white mb-4">Run Trace</h3>
      <p className="text-xs text-slate-400 mb-6">
        No trace steps were captured during the initial analysis. You can execute a trace now by providing the required inputs.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {needsEntryFunction && (
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Entry Function <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              placeholder="e.g., main, solve"
              value={entryFunction}
              onChange={(e) => setEntryFunction(e.target.value)}
              disabled={isRunning}
            />
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">
            Input Parameters (JSON Array)
          </label>
          <textarea
            className="w-full bg-slate-950/50 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors min-h-[80px]"
            placeholder="[1, 2, 3]"
            value={inputJson}
            onChange={(e) => setInputJson(e.target.value)}
            disabled={isRunning}
          />
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-xs">
            {error}
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isRunning ? (
              <>
                <svg className="animate-spin w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Running Trace...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Run Trace
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
