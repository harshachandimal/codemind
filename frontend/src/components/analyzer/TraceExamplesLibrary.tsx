import React, { useState, useMemo } from 'react';
import Panel from '../common/Panel';
import { TRACE_EXAMPLES, TraceExample, TraceExampleCategory } from '../../constants/traceExamples';
import TraceExampleCard from './TraceExampleCard';
import TraceExampleFilters from './TraceExampleFilters';
import TraceExamplePreviewModal from './TraceExamplePreviewModal';

type Props = {
  onSelectExample: (example: TraceExample) => void;
  onRunExample?: (example: TraceExample) => void;
};

const TraceExamplesLibrary: React.FC<Props> = ({ onSelectExample, onRunExample }) => {
  const [selectedCategory, setSelectedCategory] = useState<TraceExampleCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewExample, setPreviewExample] = useState<TraceExample | null>(null);

  const filteredExamples = useMemo(() => {
    return TRACE_EXAMPLES.filter((example) => {
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
  }, [selectedCategory, searchQuery]);

  return (
    <>
      <Panel className="p-6 flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Try a Trace Example</h2>
            <span className="text-xs font-medium text-white/40">Showing {filteredExamples.length} of {TRACE_EXAMPLES.length} examples</span>
          </div>
          <p className="text-sm text-white/50">Load a safe example that CodeMind can trace step by step.</p>
        </div>

        <TraceExampleFilters
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />
        
        {filteredExamples.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredExamples.map((example) => (
              <TraceExampleCard key={example.id} example={example} onClick={() => setPreviewExample(example)} />
            ))}
          </div>
        ) : (
          <div className="py-8 text-center border border-dashed border-white/10 rounded-xl bg-white/5">
            <p className="text-sm text-white/50">No examples found. Try another category or search term.</p>
          </div>
        )}
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
