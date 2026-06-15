import React from 'react';
import PageShell from '../components/common/PageShell';
import SectionHeader from '../components/common/SectionHeader';
import { useLanguageCapabilities } from '../hooks/useLanguageCapabilities';
import { LanguageCapabilityCard } from '../components/languages/LanguageCapabilityCard';

export const LanguageCapabilitiesPage: React.FC = () => {
  const { capabilities, loading, error } = useLanguageCapabilities();

  return (
    <PageShell>
      <div className="w-full max-w-7xl mx-auto px-6 py-12">
        <SectionHeader 
          title="Language Support & Capabilities" 
          description="CodeMind provides varying levels of support for different programming languages. This page details what is fully supported, what is experimental, and the current status of the runtime execution environment." 
        />
        
        <div className="mt-12">
          {loading ? (
            <div className="text-center py-12 text-white/50 animate-pulse">
              Loading capabilities...
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 px-6 py-5">
              <span className="text-sm text-rose-300">Error loading capabilities: {error}</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {capabilities.map((cap) => (
                <LanguageCapabilityCard key={cap.language} capability={cap} />
              ))}
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
};
