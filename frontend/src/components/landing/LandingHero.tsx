import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const LandingHero = () => {
  const { isAuthenticated } = useAuth();
  const analyzerPath = isAuthenticated ? '/analyzer' : '/register';

  return (
    <section className="w-full max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
      {/* Glow blob */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] opacity-20"
        style={{ background: 'radial-gradient(ellipse at center, #6366f1 0%, #7c3aed 50%, transparent 80%)', filter: 'blur(80px)' }}
      />

      <div className="relative z-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-semibold tracking-wider uppercase mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
          Runtime Intelligence Platform
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6 max-w-4xl mx-auto">
          Understand code{' '}
          <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
            beyond output.
          </span>
        </h1>

        {/* Subheading */}
        <p className="text-lg sm:text-xl text-white/50 max-w-2xl mx-auto leading-relaxed mb-10">
          Analyze complexity, trace execution flow, inspect variables, and visualize
          recursion across JavaScript, Python, and Java.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
          <Link
            to={analyzerPath}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-indigo-900/50 hover:shadow-indigo-800/60 hover:-translate-y-0.5"
          >
            Start Analyzing <span aria-hidden="true">→</span>
          </Link>
          <Link
            to="/analyzer"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] text-white/80 hover:text-white font-semibold text-sm transition-all duration-200"
          >
            Try Examples
          </Link>
        </div>

        {/* Trust line */}
        <p className="mt-8 text-xs text-white/25">
          Safe interpreter-based execution · No arbitrary code runs on your machine
        </p>
      </div>
    </section>
  );
};

export default LandingHero;
