'use client';

import MuiCard from '@mui/material/Card';
import MuiCardHeader from '@mui/material/CardHeader';
import MuiCardContent from '@mui/material/CardContent';
import MuiCardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import type { CardHeaderProps as MuiCardHeaderProps } from '@mui/material';

export const Card = MuiCard;
export const CardContent = MuiCardContent;
export const CardActions = MuiCardActions;

export interface CardHeaderProps extends Omit<MuiCardHeaderProps, 'title'> {
  title?: React.ReactNode;
  subheader?: React.ReactNode;
}

export function CardHeader({ title, subheader, ...props }: CardHeaderProps) {
  return <MuiCardHeader title={title} subheader={subheader} {...props} />;
}

/** Alias for CardHeader title slot with typography variant */
export function CardTitle({ children, ...props }: { children?: React.ReactNode; className?: string }) {
  return (
    <Typography variant="h6" component="div" sx={{ fontWeight: 600 }} {...props}>
      {children}
    </Typography>
  );
}

/** Alias for CardHeader subheader or secondary text */
export function CardDescription({ children, ...props }: { children?: React.ReactNode; className?: string }) {
  return (
    <Typography variant="body2" color="text.secondary" {...props}>
      {children}
    </Typography>
  );
}

/** CardFooter: same as CardActions, for API compatibility */
export const CardFooter = MuiCardActions;
