import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PageShell from '../components/common/PageShell';
import SectionHeader from '../components/common/SectionHeader';
import CodeInputPanel from '../components/analyzer/CodeInputPanel';
import SupportedSyntaxPanel from '../components/trace/SupportedSyntaxPanel';
import AnalysisResultShell from '../components/analysis-result/AnalysisResultShell';
import TraceExamplesLibrary from '../components/analyzer/TraceExamplesLibrary';
import ExampleExpectationPanel from '../components/analyzer/ExampleExpectationPanel';
import { TraceExample } from '../constants/traceExamples';
import { Analysis } from '../types/analysis';
import { createAnalysis } from '../services/analysisService';
import { useUserSettings } from '../hooks/useUserSettings';

const defaultCode = `function sum(arr) {
  let total = 0;
  for (let i = 0; i < arr.length; i++) {
    total = total + arr[i];
  }
  return total;
}`;

const AnalyzerPage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [sourceCode, setSourceCode] = useState(defaultCode);
  const [entryFunction, setEntryFunction] = useState('sum');
  const [inputJson, setInputJson] = useState('[[2,4,6]]');
  const [latestAnalysis, setLatestAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeExample, setActiveExample] = useState<TraceExample | null>(null);
  const [language, setLanguage] = useState<string>('javascript');
  const [hasAppliedSettings, setHasAppliedSettings] = useState(false);

  const { settings, isLoading: isLoadingSettings } = useUserSettings();

  useEffect(() => {
    if (!isLoadingSettings && !hasAppliedSettings) {
      setLanguage(settings.default_language);
      setHasAppliedSettings(true);
    }
  }, [isLoadingSettings, hasAppliedSettings, settings]);

  const handleSelectExample = (example: TraceExample) => {
    setActiveExample(example);
    setTitle(example.title);
    setSourceCode(example.sourceCode);
    setEntryFunction(example.entryFunction);
    setInputJson(JSON.stringify(example.input, null, 2));
    setLanguage(example.language || 'javascript');
    setSuccessMessage(`Loaded example: ${example.title}`);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const submitAnalysisPayload = async (payload: {
    title: string;
    sourceCode: string;
    entryFunction: string;
    inputJson: string;
  }) => {
    if (!payload.sourceCode.trim()) return;
    setError(null);
    setLoading(true);
    try {
      let parsedInput: unknown[] | undefined = undefined;
      if (payload.inputJson.trim()) {
        const parsed = JSON.parse(payload.inputJson);
        if (!Array.isArray(parsed)) {
          setError('Input must be a valid JSON array.');
          setLoading(false);
          return;
        }
        parsedInput = parsed;
      }

      const res = await createAnalysis({
        title: payload.title,
        language: language as any,
        source_code: payload.sourceCode,
        entryFunction: payload.entryFunction.trim() || null,
        input: parsedInput,
      });
      if (res.data) {
        setLatestAnalysis(res.data.analysis);
      }
    } catch (err: any) {
      setError('Analysis failed. Please check your code and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    await submitAnalysisPayload({ title, sourceCode, entryFunction, inputJson });
  };

  const handleRunExample = async (example: TraceExample) => {
    setActiveExample(example);
    setTitle(example.title);
    setSourceCode(example.sourceCode);
    setEntryFunction(example.entryFunction);
    const inputStr = JSON.stringify(example.input, null, 2);
    setInputJson(inputStr);
    setLanguage(example.language || 'javascript');
    setSuccessMessage(null);
    
    await submitAnalysisPayload({
      title: example.title,
      sourceCode: example.sourceCode,
      entryFunction: example.entryFunction,
      inputJson: inputStr,
    });
  };

  return (
    <PageShell>
      <div className="w-full max-w-[1500px] mx-auto px-6 py-12">
        <div className="mb-6 flex justify-start">
          <Link 
            to="/dashboard" 
            className="text-slate-400 hover:text-white flex items-center gap-2 transition-colors text-sm w-fit"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>
        </div>
        <SectionHeader 
          title="Code Analyzer" 
          description="Submit your code to detect patterns and calculate complexity." 
        />
        
        {latestAnalysis ? (
          <div className="flex flex-col gap-6 mt-8 animate-in fade-in duration-300">
            <div className="flex justify-end">
              <button
                onClick={() => setLatestAnalysis(null)}
                className="px-4 py-2 text-sm font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors border border-slate-700 flex items-center gap-2 shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
                </svg>
                New Analysis
              </button>
            </div>
            <ExampleExpectationPanel example={activeExample} analysis={latestAnalysis} />
            <AnalysisResultShell analysis={latestAnalysis} settings={settings} />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(420px,560px)_minmax(520px,760px)] mt-8 animate-in fade-in duration-300 items-start">
            {/* Left Column: Examples & Helpers */}
            <div className="flex flex-col gap-8">
              <TraceExamplesLibrary 
                selectedLanguage={language}
                onLanguageChange={setLanguage}
                onSelectExample={handleSelectExample} 
                onRunExample={handleRunExample} 
              />
              <SupportedSyntaxPanel compact={true} />
            </div>

            {/* Right Column: Code Input Form */}
            <div className="flex flex-col gap-4 xl:sticky xl:top-24">
              {successMessage && (
                <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-4 py-3 rounded-xl text-sm font-medium">
                  {successMessage}
                </div>
              )}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 shadow-2xl p-6 sm:p-8 backdrop-blur-sm">
                <CodeInputPanel
                  title={title}
                  sourceCode={sourceCode}
                  entryFunction={entryFunction}
                  inputJson={inputJson}
                  loading={loading}
                  error={error}
                  onTitleChange={setTitle}
                  onSourceCodeChange={setSourceCode}
                  onEntryFunctionChange={setEntryFunction}
                  onInputJsonChange={setInputJson}
                  onSubmit={handleSubmit}
                  editorFontSize={settings.editor_font_size}
                  language={language}
                  onLanguageChange={setLanguage}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
};

export default AnalyzerPage;
