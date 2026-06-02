import React, { useEffect, useState } from 'react';
import PageShell from '../components/common/PageShell';
import SectionHeader from '../components/common/SectionHeader';
import HistoryList from '../components/history/HistoryList';
import SelectedAnalysisPanel from '../components/history/SelectedAnalysisPanel';
import HistoryEmptyState from '../components/history/HistoryEmptyState';
import HistoryErrorState from '../components/history/HistoryErrorState';
import { Analysis } from '../types/analysis';
import { getAnalyses, deleteAnalysis } from '../services/analysisService';

const HistoryPage: React.FC = () => {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchAnalyses();
  }, []);

  const fetchAnalyses = async () => {
    try {
      const res = await getAnalyses();
      const list = res.data?.analyses || [];
      setAnalyses(list);
      if (list.length > 0) setSelectedAnalysis(list[0]);
    } catch (err) {
      setError('Could not fetch your analyses. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedAnalysis) return;
    setDeleting(true);
    try {
      await deleteAnalysis(selectedAnalysis.id);
      const nextAnalyses = analyses.filter(a => a.id !== selectedAnalysis.id);
      setAnalyses(nextAnalyses);
      setSelectedAnalysis(nextAnalyses.length > 0 ? nextAnalyses[0] : null);
    } catch (err) {
      alert('Failed to delete analysis. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <PageShell>
      <div className="w-full max-w-7xl mx-auto px-6 py-12">
        <SectionHeader 
          title="Analysis History" 
          description="View and manage your previous code analysis reports." 
        />
        
        <div className="mt-8">
          {loading ? (
            <div className="text-center py-12 text-white/50">Loading history...</div>
          ) : error ? (
            <HistoryErrorState message={error} />
          ) : analyses.length === 0 ? (
            <HistoryEmptyState />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-6 items-start">
              <HistoryList 
                analyses={analyses} 
                selectedAnalysisId={selectedAnalysis?.id || null} 
                onSelect={setSelectedAnalysis} 
              />
              <div className="sticky top-6 h-[calc(100vh-8rem)]">
                <SelectedAnalysisPanel 
                  analysis={selectedAnalysis} 
                  deleting={deleting} 
                  onDelete={handleDelete} 
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
};

export default HistoryPage;
