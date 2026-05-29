import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getHealthStatus } from '../services/healthService';
import { ApiResponse, HealthData } from '../types/api';
import PageShell from '../components/common/PageShell';
import SectionHeader from '../components/common/SectionHeader';
import StatusPill from '../components/common/StatusPill';
import HealthLoadingCard from '../components/health/HealthLoadingCard';
import HealthSuccessCard from '../components/health/HealthSuccessCard';
import HealthErrorCard from '../components/health/HealthErrorCard';
import HealthDiagnosticsPanel from '../components/health/HealthDiagnosticsPanel';

const HealthPage = () => {
  const [healthData, setHealthData] = useState<ApiResponse<HealthData> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getHealthStatus()
      .then(setHealthData)
      .catch((err: Error) => {
        console.error('API Error:', err);
        setError(err.message || 'Failed to fetch health status');
      })
      .finally(() => setLoading(false));
  }, []);

  const pillStatus = loading ? 'checking' : error ? 'error' : 'connected';
  const pillLabel  = loading ? 'Checking'  : error ? 'Error'   : 'Connected';

  return (
    <PageShell>
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/5">
        <Link
          to="/"
          className="text-sm font-semibold tracking-widest text-indigo-400 uppercase hover:text-indigo-300 transition-colors"
        >
          ← CodeMind
        </Link>
        <StatusPill label={pillLabel} status={pillStatus} />
      </nav>

      <main className="flex-1 flex flex-col items-center px-6 py-20">
        <div className="mb-12 text-center">
          <SectionHeader
            eyebrow="System Status"
            title="API Health Check"
            description="Verifying the full-stack link between React, Axios, Laravel, and MySQL."
          />
        </div>

        <div className="w-full max-w-md">
          {loading && <HealthLoadingCard />}
          {!loading && error && <HealthErrorCard message={error} />}
          {!loading && !error && healthData?.data && (
            <HealthSuccessCard
              message={healthData.message}
              app={healthData.data.app}
              database={healthData.data.database}
            />
          )}
          <HealthDiagnosticsPanel />
        </div>

        <Link
          to="/"
          className="mt-10 text-sm text-white/30 hover:text-white/70 transition-colors duration-200"
        >
          ← Back to Home
        </Link>
      </main>
    </PageShell>
  );
};

export default HealthPage;
