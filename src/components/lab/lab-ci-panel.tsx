'use client';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { CheckCircle2, ExternalLink, XCircle } from 'lucide-react';
import { LabSectionCard } from '@/components/lab/md3/lab-section-card';
import { CI_WORKFLOW_URL, type CiRun } from '@/lib/ci-status';
import type { Locale, Translations } from '@/lib/types';

type LabCiPanelProps = {
  translations: Translations;
  locale: Locale;
  runs: CiRun[];
};

/**
 * The rest of the lab is a simulation; this panel is not. Each row is a real CI
 * run that validated and planned this repo's Terraform against an emulated AWS
 * API. Dates are the runs' own, so the statement stays true however old the
 * build is.
 */
export function LabCiPanel({ translations, locale, runs }: LabCiPanelProps) {
  const t = translations.lab.ci;
  if (runs.length === 0) return null;

  const green = runs.filter((run) => run.conclusion === 'success').length;

  return (
    <LabSectionCard
      id="ci"
      title={t.title}
      subtitle={t.subtitle}
      collapseOnCompact
      action={
        <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
          <Chip
            size="small"
            label={t.real}
            sx={{ height: 22, bgcolor: 'var(--md-sys-color-primary-container)', color: 'var(--md-sys-color-on-primary-container)', fontWeight: 700 }}
          />
          <Typography variant="caption" sx={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
            {t.summary.replace('{green}', String(green)).replace('{total}', String(runs.length))}
          </Typography>
        </Stack>
      }
    >
      <Stack spacing={1}>
        {runs.map((run) => {
          const ok = run.conclusion === 'success';
          return (
            <Box
              key={run.id}
              component="a"
              href={run.url}
              target="_blank"
              rel="noopener noreferrer"
              className="lab-md3-surface-high"
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '20px 1fr auto', sm: '20px 90px 1fr auto' },
                alignItems: 'center',
                gap: 1.5,
                p: 1.5,
                borderRadius: 'var(--lab-radius-md)',
                textDecoration: 'none',
                color: 'inherit',
                '&:hover': { bgcolor: 'var(--md-sys-color-surface-container-high)' },
              }}
            >
              {ok ? (
                <CheckCircle2 size={18} aria-hidden style={{ color: 'var(--md-sys-color-tertiary)' }} />
              ) : (
                <XCircle size={18} aria-hidden style={{ color: 'var(--md-sys-color-error)' }} />
              )}
              <Typography
                sx={{ display: { xs: 'none', sm: 'block' }, fontFamily: 'var(--font-family-mono), monospace', fontSize: '0.8rem' }}
              >
                {run.shortSha}
              </Typography>
              <Typography variant="body2" sx={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
                #{run.runNumber} · {run.event} ·{' '}
                {new Date(run.createdAt).toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' })}
              </Typography>
              <ExternalLink size={14} aria-hidden style={{ color: 'var(--md-sys-color-on-surface-variant)' }} />
            </Box>
          );
        })}
        <Box
          component="a"
          href={CI_WORKFLOW_URL}
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            fontSize: '0.8125rem',
            color: 'var(--md-sys-color-primary)',
            textDecoration: 'underline',
            textUnderlineOffset: '3px',
            mt: 0.5,
          }}
        >
          {t.viewWorkflow}
        </Box>
      </Stack>
    </LabSectionCard>
  );
}
