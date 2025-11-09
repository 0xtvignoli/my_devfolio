'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeroCTAButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  icon?: LucideIcon;
  className?: string;
}

export function HeroCTAButton({
  href,
  children,
  variant = 'primary',
  icon: Icon,
  className,
}: HeroCTAButtonProps) {
  const baseStyles = "group relative overflow-hidden rounded-[var(--radius-pill)] px-8 font-semibold shadow-[var(--glow-soft)] transition-all duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2";
  
  const variantStyles = {
    primary: cn(
      "border border-[var(--neon-accent)]/80 bg-[var(--neon-accent)] text-[#010b10]",
      "hover:bg-[var(--neon-accent)]/95 hover:border-[var(--neon-accent)] hover:shadow-[0_0_20px_rgba(0,242,138,0.4)]",
      "focus-visible:ring-[var(--neon-accent)]/60",
      "after:absolute after:inset-0 after:-z-10 after:bg-[var(--accent-gradient)] after:opacity-0 after:transition-opacity after:duration-300",
      "group-hover:after:opacity-100"
    ),
    secondary: cn(
      "border border-[var(--neon-accent)]/60 bg-transparent text-white backdrop-blur-sm",
      "hover:bg-[var(--neon-accent)] hover:border-[var(--neon-accent)] hover:text-[#010b10] hover:shadow-[0_0_20px_rgba(0,242,138,0.3)]",
      "focus-visible:ring-[var(--neon-accent)]/60"
    ),
    outline: cn(
      "border border-white/30 bg-[var(--bg-secondary)]/80 backdrop-blur-sm text-white",
      "hover:border-[var(--neon-accent)]/80 hover:bg-[var(--bg-secondary)] hover:text-white hover:shadow-[0_0_20px_rgba(0,242,138,0.2)]",
      "focus-visible:ring-[var(--neon-accent)]/60",
      "relative before:absolute before:inset-0 before:rounded-[var(--radius-pill)] before:bg-[var(--accent-gradient)] before:p-[2px] before:opacity-0 before:transition-opacity before:duration-500 before:-z-10",
      "group-hover:before:opacity-100"
    ),
  };

  const iconStyles = {
    primary: "text-[#010b10]",
    secondary: "text-[var(--neon-accent)] group-hover:text-[#010b10] transition-colors duration-300",
    outline: "text-[var(--neon-accent)] group-hover:text-white transition-colors duration-300",
  };

  const arrowStyles = {
    primary: "text-[#010b10]",
    secondary: "text-white group-hover:text-[#010b10] transition-colors duration-300",
    outline: "text-white group-hover:text-white transition-colors duration-300",
  };

  return (
    <Button
      asChild
      size="lg"
      className={cn(baseStyles, variantStyles[variant], className)}
    >
      <Link href={href} className="relative z-10 flex items-center gap-2">
        {Icon && (
          <Icon className={cn("h-4 w-4", iconStyles[variant])} />
        )}
        <span>{children}</span>
        <ArrowRight className={cn("h-4 w-4 transition-transform duration-300 group-hover:translate-x-1", arrowStyles[variant])} />
      </Link>
    </Button>
  );
}

