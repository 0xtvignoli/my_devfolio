'use client';

import { Typography, type TypographyProps } from '@mui/material';
import { cn } from '@/lib/utils';

interface SectionHeadingProps extends Omit<TypographyProps, 'variant'> {
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  className?: string;
  /** Optional ASCII marker rendered before the label (e.g. "[+]", "##"). */
  marker?: string;
  /** Show the manpage-style hairline rule under the heading (default true). */
  rule?: boolean;
  children: React.ReactNode;
}

export function SectionHeading({
  variant = 'h2',
  className,
  marker,
  rule = true,
  children,
  sx,
  ...typographyProps
}: SectionHeadingProps) {
  return (
    <Typography
      variant={variant}
      component={variant}
      className={cn('font-headline font-bold', className)}
      sx={{
        fontWeight: 700,
        pb: rule ? 1 : 0,
        borderBottom: rule ? '1px solid' : 'none',
        borderColor: 'divider',
        ...sx,
      }}
      {...typographyProps}
    >
      {marker && (
        <Typography component="span" aria-hidden sx={{ color: 'text.secondary', mr: 1, fontWeight: 700 }}>
          {marker}
        </Typography>
      )}
      {children}
    </Typography>
  );
}
