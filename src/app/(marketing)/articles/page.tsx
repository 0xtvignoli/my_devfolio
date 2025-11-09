import { ArticleCard } from "@/components/shared/article-card";
import { getArticles } from "@/data/content/articles";
import { resolveLocale, getTranslations } from "@/lib/i18n/server";

export default async function ArticlesPage() {
    const locale = await resolveLocale();
    const t = getTranslations(locale);
    const articles = getArticles(locale);

    return (
        <div className="container mx-auto px-4 py-16">
            <div className="text-center mb-12">
                <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight">
                    {t.nav.articles}
                </h1>
                <p className="text-lg text-muted-foreground mt-2">
                    Deep dives into cloud technologies, automation, and best practices.
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {articles.map((article) => (
                    <ArticleCard key={article.slug} article={article} locale={locale} translations={t} />
                ))}
            </div>
        </div>
    );
}
