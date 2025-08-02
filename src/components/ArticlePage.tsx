import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from '@/hooks/useLanguage';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react';
import { translations } from '@/data/translations';

interface ArticlePageProps {
  children: React.ReactNode;
  title: string;
  description: string;
  content: React.ReactNode;
  publishDate: string;
  readTime: string;
}

export const ArticlePage = ({ 
  children, 
  title, 
  description, 
  content, 
  publishDate, 
  readTime 
}: ArticlePageProps) => {
  const navigate = useNavigate();
  const { language, toggleLanguage } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const t = translations[language];

  // Debug: log language changes
  useEffect(() => {
    console.log('ArticlePage language changed:', language);
  }, [language]);

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);
    // Animation on mount
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navigation language={language} onLanguageToggle={toggleLanguage} />
      
      <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {/* Article Header */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
          <div className="container mx-auto px-4">
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="mb-8 bg-white/80 hover:bg-white hover:text-blue-600 hover:border-blue-600 transition-all duration-300 shadow-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t.backToArticles}
            </Button>
            
            <div className="max-w-4xl mx-auto">
              <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
                {title}
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                {description}
              </p>
              
              <div className="flex items-center space-x-6 text-gray-500">
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  <span>Thomas Vignoli</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>{publishDate}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  <span>{readTime}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Article Content */}
        <div className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto prose prose-lg prose-blue max-w-none">
              {content}
            </div>
          </div>
        </div>
      </div>

      <Footer language={language} />
    </div>
  );
}; 