import { Link } from 'react-router-dom';
import Badge from '../common/Badge';

const HeroSection = () => {
  return (
    <section className="w-full max-w-5xl px-6 pt-16 pb-12 flex justify-center">
      {/* Glassmorphism card */}
      <div className="relative w-full rounded-3xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-xl shadow-2xl shadow-black/40 overflow-hidden px-8 sm:px-16 py-16 text-center">

        {/* Inner top-center glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-[480px] h-[280px] rounded-full opacity-25"
          style={{
            background:
              'radial-gradient(ellipse at center, #6366f1 0%, #7c3aed 40%, transparent 80%)',
            filter: 'blur(48px)',
          }}
        />

        {/* Content */}
        <div className="relative z-10">
          <div className="mb-8">
            <Badge variant="default">Runtime Intelligence Platform</Badge>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-tight mb-6 max-w-4xl mx-auto">
            Understand code{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
              beyond output.
            </span>
          </h1>

          <p className="text-lg text-white/50 max-w-2xl mx-auto leading-relaxed mb-12">
            Analyze complexity, detect recursion, trace execution flow, and visualize
            how programs work internally.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <Link
              to="/health"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-indigo-900/40"
            >
              Check API Health <span aria-hidden="true">→</span>
            </Link>
            <span className="text-sm text-white/30 font-medium">
              Frontend foundation is ready.
            </span>
          </div>
        </div>

        {/* Bottom edge shimmer */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-0 right-0 h-px"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, rgba(99,102,241,0.4) 50%, transparent 100%)',
          }}
        />
      </div>
    </section>
  );
};

export default HeroSection;
