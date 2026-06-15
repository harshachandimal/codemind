import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import PageShell from '../components/common/PageShell';
import Badge from '../components/common/Badge';
import DashboardStatCard from '../components/dashboard/DashboardStatCard';
import DashboardVisualBarList from '../components/dashboard/DashboardVisualBarList';
import LatestAnalysesList from '../components/dashboard/LatestAnalysesList';
import DashboardEmptyState from '../components/dashboard/DashboardEmptyState';
import { getDashboardAnalytics } from '../services/dashboardService';
import type { DashboardAnalyticsData } from '../types/dashboard';
import { useUserSettings } from '../hooks/useUserSettings';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [analytics, setAnalytics] = useState<DashboardAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { settings } = useUserSettings();
  const isCompact = settings?.dashboard_density === 'compact';

  const loadAnalytics = useCallback(() => {
    setIsLoading(true);
    setError(null);
    getDashboardAnalytics()
      .then(setAnalytics)
      .catch(() => setError('Unable to load dashboard analytics.'))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isEmpty = analytics?.summary.total_analyses === 0;

  return (
    <PageShell>
      {/* Nav */}
      <nav className="w-full flex items-center justify-between px-8 py-5 border-b border-white/5">
        <Badge variant="muted">CodeMind</Badge>
        <div className="flex items-center gap-4">
          <span className="text-xs text-white/40">{user?.email}</span>
          <button
            onClick={() => navigate('/languages')}
            className="text-sm font-medium text-white/60 hover:text-white px-2 py-2 rounded-lg transition-all duration-200"
          >
            Language Support
          </button>
          <button
            onClick={() => navigate('/settings')}
            className="text-sm font-medium text-white/60 hover:text-white px-2 py-2 rounded-lg transition-all duration-200"
          >
            Settings
          </button>
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-white/60 hover:text-white border border-white/10 hover:border-white/20 px-4 py-2 rounded-lg transition-all duration-200"
          >
            Sign out
          </button>
        </div>
      </nav>

      {/* Content */}
      <main className={`flex-1 w-full max-w-6xl mx-auto px-6 ${isCompact ? 'py-6 space-y-6' : 'py-12 space-y-10'}`}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div>
            <p className="text-xs font-semibold tracking-widest text-indigo-400 uppercase mb-3">
              Dashboard
            </p>
            <h1 className="text-3xl font-bold text-white">
              Welcome back, {user?.name}.
            </h1>
            <p className="mt-2 text-sm text-white/40">
              Your CodeMind analytics at a glance.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/analyzer')}
              className="inline-flex items-center justify-center bg-indigo-500 hover:bg-indigo-600 text-white font-medium text-sm px-5 py-2.5 rounded-lg transition-colors shadow-lg shadow-indigo-500/20 ring-1 ring-indigo-500/50"
            >
              Analyze Code
            </button>
            <button
              onClick={() => navigate('/history')}
              className="inline-flex items-center justify-center bg-white/5 hover:bg-white/10 text-white font-medium text-sm px-5 py-2.5 rounded-lg transition-colors border border-white/10"
            >
              View History
            </button>
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-white/40 animate-pulse">Loading dashboard analytics...</p>
          </div>
        )}

        {/* Error */}
        {!isLoading && error && (
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 px-6 py-5 flex items-center justify-between">
            <span className="text-sm text-rose-300">{error}</span>
            <button
              onClick={loadAnalytics}
              className="text-xs font-medium text-rose-200 bg-rose-500/20 hover:bg-rose-500/30 px-3 py-1.5 rounded transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Analytics */}
        {!isLoading && analytics && (
          <>
            {/* Summary cards */}
            <section>
              <p className="text-xs font-semibold tracking-widest text-white/30 uppercase mb-4">Overview</p>
              <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 ${isCompact ? 'gap-3' : 'gap-4'}`}>
                <DashboardStatCard label="Total" value={analytics.summary.total_analyses} accent="indigo" />
                <DashboardStatCard label="Completed" value={analytics.summary.completed_analyses} accent="emerald" />
                <DashboardStatCard label="Failed" value={analytics.summary.failed_analyses} accent="rose" />
                <DashboardStatCard label="Last 7 days" value={analytics.recent_activity.last_7_days} accent="amber" />
                <DashboardStatCard label="Last 30 days" value={analytics.recent_activity.last_30_days} accent="indigo" />
              </div>
            </section>

            {/* Empty state prompt */}
            {isEmpty && (
              <DashboardEmptyState
                title="No analyses yet"
                description="Run your first code analysis to unlock complexity insights, trace summaries, and dashboard trends."
                actionLabel="Start analyzing"
                onAction={() => navigate('/analyzer')}
              />
            )}

            {/* Breakdowns */}
            {!isEmpty && (
              <>
                <section>
                  <p className="text-xs font-semibold tracking-widest text-white/30 uppercase mb-4">Breakdowns</p>
                  <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 ${isCompact ? 'gap-3' : 'gap-4'}`}>
                    <DashboardVisualBarList title="Languages" items={analytics.language_breakdown} emptyMessage="No languages recorded yet." />
                    <DashboardVisualBarList title="Time Complexity" items={analytics.time_complexity_breakdown} emptyMessage="No complexity data yet." />
                    <DashboardVisualBarList title="Space Complexity" items={analytics.space_complexity_breakdown} emptyMessage="No complexity data yet." />
                    <DashboardVisualBarList title="Detected Patterns" items={analytics.detected_pattern_breakdown} emptyMessage="No patterns detected yet." />
                    <DashboardVisualBarList title="Trace Modes" items={analytics.trace_mode_breakdown} emptyMessage="No trace data yet." />
                  </div>
                </section>

                {/* Latest analyses */}
                <section>
                  <p className="text-xs font-semibold tracking-widest text-white/30 uppercase mb-4">Recent Analyses</p>
                  <div className={`rounded-2xl border border-white/[0.07] bg-white/[0.03] shadow-xl shadow-black/30 backdrop-blur-sm ${isCompact ? 'p-4' : 'p-6'}`}>
                    <LatestAnalysesList analyses={analytics.latest_analyses} />
                  </div>
                </section>
              </>
            )}
          </>
        )}
      </main>
    </PageShell>
  );
};

export default DashboardPage;
