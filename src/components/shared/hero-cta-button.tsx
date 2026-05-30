'use client';

import React from 'react';
import { Button } from '@/components/ui-mui';
import { ArrowRight, LucideIcon } from 'lucide-react';
import type { ButtonVariant } from '@/components/ui-mui';

interface HeroCTAButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  icon?: LucideIcon;
  className?: string;
}

const variantMap: Record<'primary' | 'secondary' | 'outline', ButtonVariant> = {
  primary: 'default',
  secondary: 'secondary',
  outline: 'outline',
};

export function HeroCTAButton({
  href,
  children,
  variant = 'primary',
  icon: Icon,
  className,
}: HeroCTAButtonProps) {
  return (
    <Button
      asChild
      href={href}
      variant={variantMap[variant]}
      size="lg"
      className={className}
      sx={{
        borderRadius: 9999,
        px: 3,
        boxShadow: 'var(--elevation-soft)',
        '&:hover': {
          transform: 'translateY(-1px)',
          boxShadow: '0 4px 12px rgba(26, 115, 232, 0.2)',
        },
      }}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        {Icon && <Icon style={{ height: 16, width: 16 }} aria-hidden />}
        <span>{children}</span>
        <ArrowRight style={{ height: 16, width: 16 }} aria-hidden />
      </span>
    </Button>
  );
}
