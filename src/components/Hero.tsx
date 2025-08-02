import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { translations } from '@/data/translations';
import { Language } from '@/hooks/useLanguage';
import profilePhoto from '@/assets/profile-photo.png';

interface HeroProps {
  language: Language;
}

export const Hero = ({ language }: HeroProps) => {
  const t = translations[language];

  const scrollToAbout = () => {
    const element = document.getElementById('about');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="min-h-screen flex items-center justify-center bg-gradient-subtle relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center fade-in">
          <div className="mb-8 scale-in">
            <img
              src={profilePhoto}
              alt="Thomas Vignoli"
              className="w-40 h-40 md:w-48 md:h-48 rounded-full mx-auto shadow-large object-cover border-4 border-white"
            />
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-4 slide-up">
            {t.heroTitle}
          </h1>
          
          <h2 className="text-xl md:text-2xl lg:text-3xl text-primary font-semibold mb-6 slide-up">
            {t.heroSubtitle}
          </h2>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8 leading-relaxed slide-up">
            {t.heroDescription}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center slide-up">
            <Button 
              onClick={scrollToAbout}
              className="btn-hero"
            >
              {t.heroCTA}
            </Button>
            
            <Button 
              variant="outline"
              className="btn-outline-primary"
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            >
              {t.getInTouch}
            </Button>
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <button 
          onClick={scrollToAbout}
          className="text-muted-foreground hover:text-primary transition-colors"
        >
          <ChevronDown className="h-8 w-8" />
        </button>
      </div>
    </section>
  );
};