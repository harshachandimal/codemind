import { Link } from 'react-router-dom';

const LINKS = [
  { label: 'Analyzer', to: '/analyzer' },
  { label: 'Dashboard', to: '/dashboard' },
  { label: 'History', to: '/history' },
  { label: 'Languages', to: '/languages' },
];

const LandingFooter = () => (
  <footer className="w-full border-t border-white/[0.05] px-6 md:px-10 py-10">
    <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
      {/* Brand */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <span className="text-white font-bold text-[10px]">C</span>
          </div>
          <span className="text-white font-bold text-sm">CodeMind</span>
        </div>
        <p className="text-[11px] text-white/25 max-w-[200px] leading-relaxed">
          Runtime intelligence for understanding code beyond output.
        </p>
      </div>

      {/* Links */}
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        {LINKS.map((l) => (
          <Link key={l.label} to={l.to} className="text-xs text-white/35 hover:text-white/70 transition-colors">
            {l.label}
          </Link>
        ))}
      </div>

      {/* Copyright */}
      <p className="text-[10px] text-white/20">
        © {new Date().getFullYear()} CodeMind
      </p>
    </div>
  </footer>
);

export default LandingFooter;
