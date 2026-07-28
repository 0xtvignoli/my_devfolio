'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ExperienceCardProps {
  dateRange: string;
  title: string;
  company: string;
  description: string;
  tags?: string[];
  isLast?: boolean;
  className?: string;
}

export function ExperienceCard({
  dateRange,
  title,
  company,
  description,
  tags,
  isLast = false,
  className,
}: ExperienceCardProps) {
  return (
    <div className={cn("relative pl-20 pb-12", !isLast && "pb-12", className)}>
      {/* Timeline line - only show if not last */}
      {!isLast && (
        <div className="absolute left-9 top-3 h-full w-px bg-border -translate-x-1/2" />
      )}

      {/* Timeline marker (ASCII-style bracket) */}
      <span
        aria-hidden
        className="absolute left-9 top-1 -translate-x-1/2 font-bold text-foreground bg-background leading-none"
      >
        [+]
      </span>

      {/* Date */}
      <p className="text-sm font-medium text-muted-foreground mb-1.5">
        {dateRange}
      </p>
      
      {/* Title */}
      <h3 className="font-headline text-2xl md:text-3xl font-bold text-foreground mb-1.5">
        {title}
      </h3>
      
      {/* Company */}
      <p className="text-base font-medium text-muted-foreground mb-4">
        {company}
      </p>
      
      {/* Description */}
      <div className="text-foreground/90 leading-relaxed mb-6 whitespace-pre-line text-base">
        {description}
      </div>

      {/* Tags */}
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="text-muted-foreground border-border hover:border-foreground transition-colors duration-150 font-normal"
            >
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

