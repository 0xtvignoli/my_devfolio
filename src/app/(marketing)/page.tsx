import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ProjectCard } from '@/components/shared/project-card';
import { projects } from '@/data/content/projects';
import { ExperienceTimeline } from '@/components/experience-timeline';
import { ArticleCard } from '@/components/shared/article-card';
import { getArticles } from '@/data/content/articles';
import { ArrowRight } from 'lucide-react';
import { EnhancedHero } from '@/components/enhanced-hero';
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

      <section id="contact" className="py-20 text-center bg-card rounded-2xl">
        <h2 className="font-headline text-3xl font-bold mb-4">{t.contact.title}</h2>
        <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">{t.contact.description}</p>
        <div className="relative group">
          <a
            href={`mailto:${t.contact.email}`}
            className="relative inline-block p-px font-semibold leading-6 text-foreground bg-card shadow-2xl cursor-pointer rounded-xl shadow-zinc-900/10 transition-transform duration-300 ease-in-out hover:scale-105 active:scale-95"
          >
            <span
              className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary via-blue-500 to-purple-500 p-[2px] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            ></span>
      
            <span className="relative z-10 block px-6 py-3 rounded-xl bg-background/95">
              <div className="relative z-10 flex items-center space-x-2">
                <span className="transition-all duration-500 group-hover:translate-x-1"
                  >Get in touch</span
                >
                <svg
                  className="w-6 h-6 transition-transform duration-500 group-hover:translate-x-1"
                  data-slot="icon"
                  aria-hidden="true"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    clipRule="evenodd"
                    d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z"
                    fillRule="evenodd"
                  ></path>
                </svg>
              </div>
            </span>
          </a>
        </div>
      </section>
    </div>
  );
}
