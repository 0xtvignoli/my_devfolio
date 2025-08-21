
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { articles } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function ArticlesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline text-3xl font-bold tracking-tight">
          Articles
        </h1>
        <p className="text-muted-foreground">
          Thoughts on technology, infrastructure, and software engineering.
        </p>
      </div>
      <div className="space-y-6">
        {articles.map((article) => (
          <Link key={article.id} href={`/articles/${article.id}`} className="group block">
            <Card className="transition-all group-hover:shadow-lg group-hover:-translate-y-1">
              <CardHeader>
                <CardTitle className="font-headline text-xl">{article.title}</CardTitle>
                <CardDescription className="pt-1">{article.summary}</CardDescription>
              </CardHeader>
              <CardFooter className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">{tag}</Badge>
                    ))}
                </div>
                <div className="flex items-center text-sm font-medium text-primary w-full sm:w-auto">
                  Read Article
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
