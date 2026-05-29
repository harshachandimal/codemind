import PageShell from '../components/common/PageShell';
import Badge from '../components/common/Badge';
import HeroSection from '../components/home/HeroSection';
import RuntimeLensPreview from '../components/home/RuntimeLensPreview';
import FeatureGrid from '../components/home/FeatureGrid';
import FoundationStatus from '../components/home/FoundationStatus';

const HomePage = () => {
  return (
    <PageShell>
      <nav className="w-full flex items-center justify-between px-8 py-5 border-b border-white/5">
        <Badge variant="muted">CodeMind</Badge>
      </nav>

      <main className="flex-1 flex flex-col items-center w-full">
        <HeroSection />
        <RuntimeLensPreview />
        <FeatureGrid />
        <FoundationStatus />
      </main>

      <footer className="w-full px-8 py-5 border-t border-white/5 text-center">
        <p className="text-xs text-white/20">
          CodeMind · Interactive Runtime Intelligence Platform
        </p>
      </footer>
    </PageShell>
  );
};

export default HomePage;
