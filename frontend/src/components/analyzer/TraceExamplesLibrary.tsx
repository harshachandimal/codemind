import React, { useState, useMemo, useEffect } from 'react';
import Panel from '../common/Panel';
import { TRACE_EXAMPLES, TraceExample, TraceExampleCategory } from '../../constants/traceExamples';
import TraceExampleFilters from './TraceExampleFilters';
import TraceExamplePreviewModal from './TraceExamplePreviewModal';
import LanguageTabs from './LanguageTabs';
import TraceExampleList from './TraceExampleList';

type Props = {
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
  onSelectExample: (example: TraceExample) => void;
  onRunExample?: (example: TraceExample) => void;
};

const TraceExamplesLibrary: React.FC<Props> = ({ 
  selectedLanguage, 
  onLanguageChange, 
  onSelectExample, 
  onRunExample 
}) => {
  const [selectedCategory, setSelectedCategory] = useState<TraceExampleCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewExample, setPreviewExample] = useState<TraceExample | null>(null);

  // Reset filters and preview when language changes
  useEffect(() => {
    setPreviewExample(null);
  }, [selectedLanguage]);

  const filteredExamples = useMemo(() => {
    return TRACE_EXAMPLES.filter((example) => {
      if (example.language !== selectedLanguage) return false;
      
      const matchesCategory = selectedCategory === 'all' || example.category === selectedCategory;
      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;
      
      const lowerQuery = searchQuery.toLowerCase().trim();
      return (
        example.title.toLowerCase().includes(lowerQuery) ||
        example.description.toLowerCase().includes(lowerQuery) ||
        example.category.toLowerCase().includes(lowerQuery)
      );
    });
  }, [selectedLanguage, selectedCategory, searchQuery]);

  return (
    <>
      <Panel className="p-6 flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white mb-1">Try a Trace Example</h2>
              <p className="text-sm text-white/50">Load a safe example that CodeMind can trace step by step.</p>
            </div>
            <span className="text-xs font-medium text-white/40 bg-white/5 px-3 py-1 rounded-full">
              {filteredExamples.length} Examples
            </span>
          </div>

          <LanguageTabs 
            selectedLanguage={selectedLanguage} 
            onLanguageChange={onLanguageChange} 
          />
        </div>

        <TraceExampleFilters
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        
        <TraceExampleList 
          examples={filteredExamples} 
          onSelectExample={setPreviewExample} 
        />
      </Panel>

      <TraceExamplePreviewModal
        example={previewExample}
        isOpen={previewExample !== null}
        onClose={() => setPreviewExample(null)}
        onLoadExample={onSelectExample}
        onRunExample={onRunExample}
      />
    </>
  );
};

export default TraceExamplesLibrary;
