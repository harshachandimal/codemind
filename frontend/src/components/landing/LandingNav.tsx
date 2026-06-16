import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const LandingNav = () => {
  const { isAuthenticated } = useAuth();

  return (
    <nav className="w-full flex items-center justify-between px-6 md:px-10 py-5 border-b border-white/[0.06] sticky top-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-xl">
      <Link to="/" className="flex items-center gap-2.5 group">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-900/50">
          <span className="text-white font-bold text-xs">C</span>
        </div>
        <span className="text-white font-bold text-base tracking-tight">CodeMind</span>
      </Link>

      <div className="hidden md:flex items-center gap-8">
        <a href="#features" className="text-sm text-white/50 hover:text-white/90 transition-colors">Features</a>
        <a href="#languages" className="text-sm text-white/50 hover:text-white/90 transition-colors">Languages</a>
        <a href="#how-it-works" className="text-sm text-white/50 hover:text-white/90 transition-colors">How it works</a>
      </div>

      <div className="flex items-center gap-3">
        {isAuthenticated ? (
          <>
            <Link to="/dashboard" className="text-sm text-white/60 hover:text-white transition-colors px-3 py-1.5">
              Dashboard
            </Link>
            <Link to="/analyzer" className="text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition-colors shadow-lg shadow-indigo-900/40">
              Analyzer
            </Link>
          </>
        ) : (
          <>
            <Link to="/login" className="text-sm text-white/60 hover:text-white transition-colors px-3 py-1.5">
              Log in
            </Link>
            <Link to="/register" className="text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition-colors shadow-lg shadow-indigo-900/40">
              Get Started
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default LandingNav;
