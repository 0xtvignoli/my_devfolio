'use client';

import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { ChevronDown } from 'lucide-react';
import { useState, type ReactNode } from 'react';

type LabSectionCardProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  id?: string;
  action?: ReactNode;
  noPadding?: boolean;
  /** When true, the section can be collapsed. Requires `expanded` + `onExpandedChange`. */
  collapsible?: boolean;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  /**
   * Below md the section starts collapsed and manages its own toggle — secondary
   * content shouldn't cost a screen of scrolling on a phone. Desktop is untouched.
   */
  collapseOnCompact?: boolean;
};

export function LabSectionCard({
  title,
  subtitle,
  children,
  id,
  action,
  noPadding,
  collapsible = false,
  expanded = true,
  onExpandedChange,
  collapseOnCompact = false,
}: LabSectionCardProps) {
  const [compactOpen, setCompactOpen] = useState(false);
  const isCompact = useMediaQuery('(max-width:899.95px)'); // theme.breakpoints.down('md')
  const selfCollapsing = collapseOnCompact && isCompact;

  const canCollapse = collapsible || selfCollapsing;
  const isOpen = selfCollapsing ? compactOpen : collapsible ? expanded : true;
  const contentId = id ? `${id}-content` : undefined;

  const toggle = () =>
    selfCollapsing ? setCompactOpen((open) => !open) : onExpandedChange?.(!expanded);

  return (
    <Box
      component="section"
      id={id}
      className="lab-md3-surface"
      sx={{ overflow: 'hidden' }}
      aria-labelledby={id ? `${id}-heading` : undefined}
    >
      <Box
        onClick={canCollapse ? toggle : undefined}
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 2,
          px: 2.5,
          py: 2,
          borderBottom: isOpen ? '1px solid var(--md-sys-color-outline-variant)' : 'none',
          bgcolor: 'var(--md-sys-color-surface-container-lowest)',
          cursor: canCollapse ? 'pointer' : 'default',
          '&:hover': canCollapse ? { bgcolor: 'var(--md-sys-color-surface-container-low)' } : undefined,
        }}
      >
        <Box>
          <Typography id={id ? `${id}-heading` : undefined} variant="h6" sx={{ fontWeight: 700 }}>
            <Box component="span" aria-hidden sx={{ color: 'var(--md-sys-color-on-surface-variant)', mr: 1 }}>
              ##
            </Box>
            {title}
          </Typography>
          {subtitle ? (
            <Typography variant="body2" sx={{ color: 'var(--md-sys-color-on-surface-variant)', mt: 0.25 }}>
              {subtitle}
            </Typography>
          ) : null}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }} onClick={(e) => e.stopPropagation()}>
          {action}
          {canCollapse ? (
            <IconButton
              size="small"
              onClick={toggle}
              aria-expanded={isOpen}
              aria-controls={contentId}
              aria-label={title}
              sx={{ color: 'var(--md-sys-color-on-surface-variant)' }}
            >
              <ChevronDown
                size={18}
                style={{
                  transform: isOpen ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.2s ease',
                }}
                aria-hidden
              />
            </IconButton>
          ) : null}
        </Box>
      </Box>
      {canCollapse ? (
        <Collapse in={isOpen} id={contentId}>
          <Box sx={{ p: noPadding ? 0 : 2.5 }}>{children}</Box>
        </Collapse>
      ) : (
        <Box sx={{ p: noPadding ? 0 : 2.5 }}>{children}</Box>
      )}
    </Box>
  );
}
