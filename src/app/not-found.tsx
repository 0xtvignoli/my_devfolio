import { Button } from '@/components/ui/button';
import { SearchX } from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center gap-6">
      <div className="flex items-center gap-4">
        <SearchX className="h-16 w-16 text-muted-foreground" />
        <div>
          <h1 className="text-8xl font-bold font-headline text-primary">404</h1>
          <p className="text-2xl font-semibold tracking-tight">Page Not Found</p>
        </div>
      </div>
      <p className="max-w-md text-muted-foreground">
        Sorry, we could not find the page you were looking for. It might have been moved, deleted,
        or maybe you just mistyped the URL.
      </p>
      <div className="w-full max-w-md space-y-3">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search articles or projects... (shortcut: /)"
            aria-label="Quick search"
            className="flex-1"
          />
          <Button variant="secondary" asChild>
            <Link href="/articles">Search</Link>
          </Button>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button asChild>
            <Link href="/">Return Home</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/projects">Go to Projects</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/articles">Read Articles</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
