import { useNavigate } from 'react-router-dom';
import { translations } from '@/data/translations';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Server, Code } from 'lucide-react';

interface ArticlesProps {
  language: 'it' | 'en';
}

const articles = [
  {
    id: 'helm-deploy',
    icon: BookOpen,
    titleKey: 'helmDeployTitle',
    descriptionKey: 'helmDeployDesc',
    color: 'bg-blue-500',
    gradient: 'from-blue-500 to-blue-600'
  },
  {
    id: 'k8s-production',
    icon: Server,
    titleKey: 'k8sProductionTitle',
    descriptionKey: 'k8sProductionDesc',
    color: 'bg-green-500',
    gradient: 'from-green-500 to-green-600'
  },
  {
    id: 'iac-best-practices',
    icon: Code,
    titleKey: 'iacBestPracticesTitle',
    descriptionKey: 'iacBestPracticesDesc',
    color: 'bg-purple-500',
    gradient: 'from-purple-500 to-purple-600'
  }
];

export const Articles = ({ language }: ArticlesProps) => {
  const navigate = useNavigate();
  const t = translations[language];

  return (
    <section id="articles" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {t.articlesTitle}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t.articlesDescription}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article) => {
            const IconComponent = article.icon;
            return (
              <Card 
                key={article.id}
                className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 shadow-lg"
                onClick={() => navigate(`/article/${article.id}`)}
              >
                <CardHeader className="pb-4">
                  <div className={`w-12 h-12 rounded-lg ${article.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">
                    {t[article.titleKey as keyof typeof t]}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 mb-6 text-base leading-relaxed">
                    {t[article.descriptionKey as keyof typeof t]}
                  </CardDescription>
                  <Button 
                    variant="outline" 
                    className="w-full group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all duration-300"
                  >
                    {t.readMore}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}; 