'use client';

import { Activity, Terminal, Gauge } from 'lucide-react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';

interface LabPreviewPanelProps {
  title: string;
  subtitle: string;
}

const pods = [
  { name: 'frontend-webapp-7b', status: 'Running' },
  { name: 'api-gateway-f9', status: 'Running' },
  { name: 'monitoring-dash-c3', status: 'Running' },
];

export function LabPreviewPanel({ title, subtitle }: LabPreviewPanelProps) {
  return (
    <Paper
      elevation={2}
      sx={{
        display: { xs: 'none', lg: 'flex' },
        flexDirection: 'column',
        height: '100%',
        minHeight: 380,
        borderRadius: 3,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
      aria-hidden="true"
    >
      <Box
        sx={{
          px: 2,
          py: 1.5,
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: 'rgba(0,0,0,0.2)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Terminal size={16} aria-hidden />
          <Typography variant="caption" sx={{ fontWeight: 600, letterSpacing: 1 }}>
            {title}
          </Typography>
        </Box>
        <Chip label="LIVE" size="small" color="success" variant="outlined" sx={{ height: 22, fontSize: '0.65rem' }} />
      </Box>

      <Box sx={{ p: 2, flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
          {subtitle}
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip icon={<Gauge size={14} />} label="cpu: 12%" size="small" variant="outlined" />
          <Chip icon={<Activity size={14} />} label="mem: 43%" size="small" variant="outlined" />
          <Chip label="p95: 81ms" size="small" variant="outlined" />
        </Box>

        <Box
          component="pre"
          sx={{
            flex: 1,
            m: 0,
            p: 1.5,
            borderRadius: 2,
            bgcolor: 'var(--lab-bg)',
            color: 'var(--lab-primary)',
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: '0.72rem',
            lineHeight: 1.6,
            overflow: 'hidden',
          }}
        >
          {`$ kubectl get pods -n production\n`}
          {pods.map((p) => `${p.name.padEnd(24)} ${p.status}\n`).join('')}
          {`\ninfra@control-plane-3:~$ _`}
        </Box>
      </Box>
    </Paper>
  );
}
