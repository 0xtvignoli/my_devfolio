'use client';

import MuiButton from '@mui/material/Button';
import MuiIconButton from '@mui/material/IconButton';
import type { ButtonProps as MuiButtonProps, IconButtonProps } from '@mui/material';
import { forwardRef } from 'react';
import Link from 'next/link';

export type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
export type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

export interface ButtonProps extends Omit<MuiButtonProps, 'variant' | 'size'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** When true, render as Next Link when href is provided. */
  asChild?: boolean;
  target?: string;
  rel?: string;
}

const variantMap: Record<ButtonVariant, MuiButtonProps['variant']> = {
  default: 'contained',
  destructive: 'contained',
  outline: 'outlined',
  secondary: 'outlined',
  ghost: 'text',
  link: 'text',
};

const sizeMap: Record<ButtonSize, MuiButtonProps['size']> = {
  default: 'medium',
  sm: 'small',
  lg: 'large',
  icon: 'small',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'default',
      size = 'default',
      asChild = false,
      href,
      children,
      color,
      ...props
    },
    ref
  ) => {
    const muiVariant = variantMap[variant];
    const muiSize = sizeMap[size];
    const isIcon = size === 'icon';
    const muiColor = variant === 'destructive' ? 'error' : color ?? (variant === 'secondary' ? 'secondary' : 'primary');
    const validHref = href != null && (typeof href === 'string' ? href !== '' : true);
    const linkProps =
      asChild && validHref ? { component: Link as React.ElementType, href } : {};
    // When using component={Link} without asChild, href must still be passed to the root
    const hrefProps = validHref ? { href } : {};

    if (isIcon) {
      return (
        <MuiIconButton ref={ref} size={muiSize} color={muiColor} {...props} {...hrefProps} {...linkProps}>
          {children}
        </MuiIconButton>
      );
    }

    return (
      <MuiButton ref={ref} variant={muiVariant} size={muiSize} color={muiColor} {...props} {...hrefProps} {...linkProps}>
        {children}
      </MuiButton>
    );
  }
);
Button.displayName = 'Button';
