import { Button } from '@/components/ui/button';
import { SearchX } from 'lucide-react';
import Link from 'next/link';

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
      <Button asChild>
        <Link href="/">Return Home</Link>
      </Button>
    </div>
  );
}
