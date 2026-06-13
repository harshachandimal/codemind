import React from 'react';
import { TraceExampleCategory } from '../../constants/traceExamples';

type Props = {
  selectedCategory: TraceExampleCategory;
  onSelectCategory: (category: TraceExampleCategory) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
};

const categories: { label: string; value: TraceExampleCategory }[] = [
  { label: 'All', value: 'all' },
  { label: 'Basics', value: 'basics' },
  { label: 'Branches', value: 'branches' },
  { label: 'Loops', value: 'loops' },
  { label: 'Arrays', value: 'arrays' },
  { label: 'Recursion', value: 'recursion' },
];

const TraceExampleFilters: React.FC<Props> = ({
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
}) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex flex-wrap items-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => onSelectCategory(cat.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              selectedCategory === cat.value
                ? 'bg-indigo-500 text-white'
                : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>
      <div className="w-full sm:w-64">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search examples..."
          className="w-full bg-black/20 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
        />
      </div>
    </div>
  );
};

export default TraceExampleFilters;
