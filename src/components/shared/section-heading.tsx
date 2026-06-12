'use client';

import { Typography, type TypographyProps } from '@mui/material';
import { cn } from '@/lib/utils';

interface SectionHeadingProps extends Omit<TypographyProps, 'variant'> {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  className?: string;
  children: React.ReactNode;
}

export function SectionHeading({
  variant = 'h2',
  className,
  children,
  ...typographyProps
}: SectionHeadingProps) {
  return (
    <Typography
      variant={variant}
      component={variant}
      className={cn('font-headline font-bold', className)}
      {...typographyProps}
    >
      {children}
    </Typography>
  );
}
