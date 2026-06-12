import React, { useState } from 'react';
import PageShell from '../components/common/PageShell';
import SectionHeader from '../components/common/SectionHeader';
import CodeInputPanel from '../components/analyzer/CodeInputPanel';
import SupportedSyntaxPanel from '../components/trace/SupportedSyntaxPanel';
import AnalysisResultPanel from '../components/analyzer/AnalysisResultPanel';
import { Analysis } from '../types/analysis';
import { createAnalysis } from '../services/analysisService';

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

  const handleSubmit = async () => {
    if (!sourceCode.trim()) return;
    setError(null);
    setLoading(true);
    try {
      let parsedInput: unknown[] | undefined = undefined;
      if (inputJson.trim()) {
        const parsed = JSON.parse(inputJson);
        if (!Array.isArray(parsed)) {
          setError('Input must be a valid JSON array.');
          setLoading(false);
          return;
        }
        parsedInput = parsed;
      }

      const res = await createAnalysis({
        title,
        language: 'javascript',
        source_code: sourceCode,
        entryFunction: entryFunction.trim() || null,
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

  return (
    <PageShell>
      <div className="w-full max-w-7xl mx-auto px-6 py-12">
        <SectionHeader 
          title="Code Analyzer" 
          description="Submit your JavaScript code to detect patterns and calculate complexity." 
        />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <div className="flex flex-col gap-8">
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
            />
            <SupportedSyntaxPanel compact={true} />
          </div>
          <AnalysisResultPanel analysis={latestAnalysis} />
        </div>
      </div>
    </PageShell>
  );
};

export default AnalyzerPage;
