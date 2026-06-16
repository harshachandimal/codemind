import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const LandingCTA = () => {
  const { isAuthenticated } = useAuth();

  return (
    <section className="w-full max-w-6xl mx-auto px-6 pb-20">
      <div className="relative rounded-3xl border border-indigo-500/20 bg-gradient-to-br from-indigo-600/10 via-violet-600/5 to-transparent overflow-hidden px-8 py-16 text-center">
        {/* Glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 100%, rgba(99,102,241,0.4) 0%, transparent 70%)' }}
        />

        <div className="relative z-10">
          <p className="text-xs font-semibold tracking-widest text-indigo-400/70 uppercase mb-4">Get started</p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white/90 mb-4">
            Ready to understand your code?
          </h2>
          <p className="text-white/40 max-w-lg mx-auto text-sm leading-relaxed mb-10">
            Paste your code, trace execution, inspect variables, and finally see what your program is actually doing at runtime.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <Link
              to={isAuthenticated ? '/analyzer' : '/register'}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all duration-200 shadow-xl shadow-indigo-900/50 hover:-translate-y-0.5"
            >
              Start Analyzing <span aria-hidden="true">→</span>
            </Link>
            {isAuthenticated && (
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-white/70 hover:text-white font-semibold text-sm transition-all duration-200"
              >
                View Dashboard
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingCTA;
