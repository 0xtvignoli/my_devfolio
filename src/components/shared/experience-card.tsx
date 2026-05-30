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
        <div className="absolute left-9 top-2 h-full w-0.5 bg-primary/25 -translate-x-1/2" />
      )}
      
      {/* Timeline dot */}
      <div className="absolute left-9 top-2 h-4 w-4 rounded-full bg-primary border-4 border-background -translate-x-1/2 shadow-sm" />
      
      {/* Date */}
      <p className="text-sm font-medium text-primary mb-1.5 tracking-wide">
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
              variant="secondary"
              className="bg-primary/8 text-primary border border-primary/20 hover:bg-primary/12 hover:border-primary/30 transition-all duration-200 font-medium"
            >
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

