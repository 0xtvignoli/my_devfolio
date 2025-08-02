import { useLanguage } from '@/hooks/useLanguage';
import { Navigation } from '@/components/Navigation';
import { Hero } from '@/components/Hero';
import { About } from '@/components/About';
import { Experience } from '@/components/Experience';
import { Projects } from '@/components/Projects';
import { Contact } from '@/components/Contact';
import { Footer } from '@/components/Footer';

const Index = () => {
  const { language, toggleLanguage } = useLanguage();

  return (
    <div className="min-h-screen">
      <Navigation language={language} onLanguageToggle={toggleLanguage} />
      <Hero language={language} />
      <About language={language} />
      <Experience language={language} />
      <Projects language={language} />
      <Contact language={language} />
      <Footer language={language} />
    </div>
  );
};

export default Index;
