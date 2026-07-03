'use client';

import React from 'react';
import { Button } from '@/components/ui-mui';
import { LucideIcon } from 'lucide-react';
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
  secondary: 'outline',
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
        borderRadius: '4px',
        px: 2.5,
        boxShadow: 'none',
        fontWeight: 500,
        '&:hover': { boxShadow: 'none' },
      }}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        {Icon && <Icon style={{ height: 16, width: 16 }} aria-hidden />}
        <span>{children}</span>
        <span aria-hidden style={{ fontWeight: 700 }}>→</span>
      </span>
    </Button>
  );
}
