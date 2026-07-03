'use client';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';

interface LabPreviewPanelProps {
  title: string;
  subtitle: string;
}

const pods = [
  { name: 'frontend-webapp-7b', status: 'Running' },
  { name: 'api-gateway-f9', status: 'Running' },
  { name: 'monitoring-dash-c3', status: 'Running' },
];

/**
 * The single dark "TUI mockup" surface of the site — a faux terminal frame
 * rendered in the OpenCode dark palette, monospaced, ASCII-only. Stays dark
 * regardless of the site light/dark theme (it is a narrative device).
 */
export function LabPreviewPanel({ title, subtitle }: LabPreviewPanelProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        display: { xs: 'none', lg: 'flex' },
        flexDirection: 'column',
        height: '100%',
        minHeight: 380,
        borderRadius: 0,
        overflow: 'hidden',
        border: '1px solid #3a3636',
        bgcolor: 'var(--oc-surface-dark)',
        color: 'var(--oc-on-dark)',
        fontFamily: 'var(--font-mono-stack)',
        fontSize: '0.78rem',
        lineHeight: 1.6,
      }}
      aria-hidden="true"
    >
      {/* Title bar */}
      <Box
        sx={{
          px: 2,
          py: 1.25,
          borderBottom: '1px solid #3a3636',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: 'var(--oc-ash)',
        }}
      >
        <Box component="span">{`opencode ~ ${title.toLowerCase()}`}</Box>
        <Box component="span" sx={{ color: 'var(--oc-success)' }}>[live]</Box>
      </Box>

      {/* Body */}
      <Box sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        <Box component="span" sx={{ color: 'var(--oc-ash)' }}>{`# ${subtitle}`}</Box>

        {/* Prompt row */}
        <Box
          sx={{
            bgcolor: 'var(--oc-surface-dark-elevated)',
            borderRadius: '4px',
            px: 1.5,
            py: 1,
            color: 'var(--oc-on-dark)',
          }}
        >
          <Box component="span" sx={{ color: 'var(--oc-success)' }}>$ </Box>
          kubectl get pods
          <Box component="span" sx={{ color: '#4da3ff' }}>{' -n production'}</Box>
        </Box>

        {/* Output */}
        <Box component="pre" sx={{ m: 0, fontFamily: 'inherit', fontSize: 'inherit', color: 'var(--oc-on-dark)', whiteSpace: 'pre' }}>
{`NAME                     STATUS
`}
          {pods.map((p) => (
            <Box component="span" key={p.name} sx={{ display: 'block' }}>
              {`${p.name.padEnd(25)}`}
              <Box component="span" sx={{ color: 'var(--oc-success)' }}>{p.status}</Box>
            </Box>
          ))}
        </Box>

        <Box sx={{ mt: 'auto', color: 'var(--oc-on-dark)' }}>
          <Box component="span" sx={{ color: 'var(--oc-ash)' }}>infra@control-plane-3:~$ </Box>
          <Box component="span" sx={{ animation: 'none' }}>_</Box>
        </Box>
      </Box>

      {/* Keybinding hint footer */}
      <Box
        sx={{
          px: 2,
          py: 1,
          borderTop: '1px solid #3a3636',
          color: 'var(--oc-ash)',
          display: 'flex',
          gap: 3,
        }}
      >
        <Box component="span">[tab] switch agent</Box>
        <Box component="span">[ctrl-p] commands</Box>
      </Box>
    </Paper>
  );
}
