'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { localizedPath } from '@/lib/i18n/paths';
import { resolveLocaleParam } from '@/lib/i18n/config';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  const params = useParams();
  const locale = resolveLocaleParam(params?.locale as string | undefined);
  const homeHref = localizedPath(locale);

  return (
    <nav aria-label="Breadcrumb" className={cn("flex items-center space-x-2 text-sm text-muted-foreground", className)}>
      <ol className="flex items-center space-x-2">
        <li>
          <Link
            href={homeHref}
            className="hover:text-foreground transition-colors flex items-center gap-1"
            aria-label="Home"
          >
            <Home className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Home</span>
          </Link>
        </li>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className="flex items-center space-x-2">
              <ChevronRight className="h-4 w-4 text-muted-foreground/50" aria-hidden="true" />
              {isLast ? (
                <span className="text-foreground font-medium" aria-current="page">
                  {item.label}
                </span>
              ) : item.href ? (
                <Link href={item.href} className="hover:text-foreground transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span>{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
