import React from 'react';

type Props = {
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
};

const languages = [
  { id: 'javascript', label: 'JavaScript' },
  { id: 'python', label: 'Python' },
  { id: 'java', label: 'Java' },
];

const LanguageTabs: React.FC<Props> = ({ selectedLanguage, onLanguageChange }) => {
  return (
    <div className="flex items-center gap-1 border-b border-white/10 pb-4">
      {languages.map((lang) => {
        const isActive = selectedLanguage === lang.id;
        return (
          <button
            key={lang.id}
            onClick={() => onLanguageChange(lang.id)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-all border-b-2 ${
              isActive
                ? 'text-indigo-400 border-indigo-500 bg-indigo-500/10'
                : 'text-white/50 border-transparent hover:text-white/80 hover:bg-white/5'
            }`}
          >
            {lang.label}
          </button>
        );
      })}
    </div>
  );
};

export default LanguageTabs;
