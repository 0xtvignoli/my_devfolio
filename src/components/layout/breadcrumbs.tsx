'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { projects } from '@/lib/data';
import { articles } from '@/lib/data';

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const getDisplayName = (segment: string) => {
  // Check projects
  const project = projects.find((p) => p.id === segment);
  if (project) return project.title;

  // Check articles
  const article = articles.find((a) => a.id === segment);
  if (article) return article.title;

  // Fallback for static paths
  return capitalize(segment.replace(/-/g, ' '));
};

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  return (
    <nav aria-label="Breadcrumb" className="text-sm font-medium text-muted-foreground">
      <ol className="flex items-center gap-2">
        <li>
          <Link href="/" className="transition-colors hover:text-foreground">
            <Home className="h-4 w-4" />
            <span className="sr-only">Home</span>
          </Link>
        </li>
        {segments.map((segment, index) => {
          const isLast = index === segments.length - 1;
          const href = `/${segments.slice(0, index + 1).join('/')}`;
          const displayName = getDisplayName(segment);

          return (
            <li key={href} className="flex items-center gap-2">
              <span className="text-muted-foreground/50">/</span>
              <Link
                href={href}
                className={cn(
                  'transition-colors hover:text-foreground',
                  isLast && 'text-foreground font-semibold pointer-events-none',
                )}
                aria-current={isLast ? 'page' : undefined}
              >
                {displayName}
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
