import React, { useState, useEffect } from 'react';
import PageShell from '../components/common/PageShell';
import SectionHeader from '../components/common/SectionHeader';
import CodeInputPanel from '../components/analyzer/CodeInputPanel';
import SupportedSyntaxPanel from '../components/trace/SupportedSyntaxPanel';
import AnalysisResultPanel from '../components/analyzer/AnalysisResultPanel';
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
      <div className="w-full max-w-7xl mx-auto px-6 py-12">
        <SectionHeader 
          title="Code Analyzer" 
          description="Submit your code to detect patterns and calculate complexity." 
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <div className="flex flex-col gap-8">
            <TraceExamplesLibrary 
              selectedLanguage={language}
              onLanguageChange={setLanguage}
              onSelectExample={handleSelectExample} 
              onRunExample={handleRunExample} 
            />
            {successMessage && (
              <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-4 py-3 rounded-xl text-sm font-medium">
                {successMessage}
              </div>
            )}
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
            <SupportedSyntaxPanel compact={true} />
          </div>
          <div className="flex flex-col gap-8">
            <ExampleExpectationPanel example={activeExample} analysis={latestAnalysis} />
            <AnalysisResultPanel 
              analysis={latestAnalysis} 
              settings={settings}
            />
          </div>
        </div>
      </div>
    </PageShell>
  );
};

export default AnalyzerPage;
