import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import PageShell from '../components/common/PageShell';
import Panel from '../components/common/Panel';
import Badge from '../components/common/Badge';
import StatusPill from '../components/common/StatusPill';

const DashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <PageShell>
      {/* Nav */}
      <nav className="w-full flex items-center justify-between px-8 py-5 border-b border-white/5">
        <Badge variant="muted">CodeMind</Badge>
        <div className="flex items-center gap-4">
          <span className="text-xs text-white/40">{user?.email}</span>
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-white/60 hover:text-white border border-white/10 hover:border-white/20 px-4 py-2 rounded-lg transition-all duration-200"
          >
            Sign out
          </button>
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-10">
          <p className="text-xs font-semibold tracking-widest text-indigo-400 uppercase mb-3">
            Dashboard
          </p>
          <h1 className="text-3xl font-bold text-white">
            Welcome back, {user?.name}.
          </h1>
          <p className="mt-2 text-sm text-white/40">
            Your CodeMind workspace is ready.
          </p>
        </div>

        {/* Workspace placeholder */}
        <Panel className="p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-base font-semibold text-white mb-1">
                Code Analysis Workspace
              </h2>
              <p className="text-sm text-white/40">
                CodeMind workspace will appear here.
              </p>
            </div>
            <StatusPill status="idle" label="Phase 4+" />
          </div>

          {/* Empty state */}
          <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-white/[0.07] rounded-xl">
            <div className="w-12 h-12 rounded-full bg-indigo-500/10 flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <p className="text-sm text-white/40 max-w-xs">
              The code editor and analysis engine will be wired up in Phase 5.
            </p>
          </div>
        </Panel>
      </main>
    </PageShell>
  );
};

export default DashboardPage;
