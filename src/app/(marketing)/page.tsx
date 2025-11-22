import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ProjectCard } from '@/components/shared/project-card';
import { projects } from '@/data/content/projects';
import { ExperienceTimeline } from '@/components/experience-timeline';
import { ArticleCard } from '@/components/shared/article-card';
import { getArticles } from '@/data/content/articles';
import { ArrowRight } from 'lucide-react';
import { EnhancedHero } from '@/components/enhanced-hero';
import { ContactSection } from '@/components/shared/contact-section';
import { resolveLocale, getTranslations } from '@/lib/i18n/server';

export default async function Home() {
  const locale = await resolveLocale();
  const t = getTranslations(locale);
  const articles = getArticles(locale);

  const featuredProjects = projects.slice(0, 2);
  const featuredArticles = articles.slice(0, 2);

  return (
    <div className="container mx-auto px-4 py-12 md:py-20">
      <EnhancedHero 
        title={t.hero.title}
        subtitle={t.hero.subtitle}
        ctaPortfolio={t.hero.ctaPortfolio}
        ctaContact={t.hero.ctaContact}
      />

      <section id="skills" className="py-16">
        <h2 className="font-headline text-3xl font-bold text-center mb-12">
          {t.skills.title}
        </h2>
        <div className="flex flex-wrap justify-center gap-4 md:gap-6">
          {t.skills.list.map((skill) => (
            <div
              key={skill}
              className="bg-card border rounded-full px-4 py-2 text-sm font-medium text-card-foreground shadow-sm"
            >
              {skill}
            </div>
          ))}
        </div>
      </section>

      <section id="portfolio" className="py-16">
        <div className="flex justify-between items-center mb-12">
           <h2 className="font-headline text-3xl font-bold">{t.portfolio.title}</h2>
           <Button variant="ghost" asChild>
            <Link href="/portfolio">{t.portfolio.viewAll} <ArrowRight className="ml-2 h-4 w-4" /></Link>
           </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {featuredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} locale={locale} translations={t} />
          ))}
        </div>
      </section>
      
      <section id="experience" className="py-16">
         <h2 className="font-headline text-3xl font-bold text-center mb-12">{t.experience.title}</h2>
         <ExperienceTimeline locale={locale} />
      </section>

      <section id="articles" className="py-16">
        <div className="flex justify-between items-center mb-12">
            <h2 className="font-headline text-3xl font-bold">{t.articles.title}</h2>
            <Button variant="ghost" asChild>
              <Link href="/articles">{t.articles.viewAll} <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {featuredArticles.map(article => (
              <ArticleCard key={article.slug} article={article} locale={locale} translations={t} />
            ))}
        </div>
      </section>

      <ContactSection 
        email={t.contact.email}
        translations={t}
        locale={locale}
      />
    </div>
  );
}
