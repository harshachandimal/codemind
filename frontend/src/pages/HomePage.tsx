import PageShell from '../components/common/PageShell';
import LandingNav from '../components/landing/LandingNav';
import LandingHero from '../components/landing/LandingHero';
import ProductPreview from '../components/landing/ProductPreview';
import FeatureGrid from '../components/landing/FeatureGrid';
import LanguageSupportPreview from '../components/landing/LanguageSupportPreview';
import HowItWorks from '../components/landing/HowItWorks';
import SafetySection from '../components/landing/SafetySection';
import LandingCTA from '../components/landing/LandingCTA';
import LandingFooter from '../components/landing/LandingFooter';

const HomePage = () => {
  return (
    <PageShell>
      <LandingNav />
      <main className="flex-1 flex flex-col items-center w-full overflow-x-hidden">
        <LandingHero />
        <ProductPreview />
        <FeatureGrid />
        <LanguageSupportPreview />
        <HowItWorks />
        <SafetySection />
        <LandingCTA />
      </main>
      <LandingFooter />
    </PageShell>
  );
};

export default HomePage;
