'use client';

import type { Incident, Translations } from '@/lib/types';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';
import { LabEmptyState, LabCodeHint } from '@/components/lab/md3/lab-empty-state';
import { Fragment } from 'react';

interface IncidentHistoryProps {
  incidents: Incident[];
  translations: Translations;
}

const statusConfig = {
  Resolved: { icon: CheckCircle, color: 'var(--md-sys-color-tertiary)' },
  Investigating: { icon: AlertTriangle, color: 'var(--md-sys-color-warning)' },
};

/** Renders "{command}" placeholders in localized hints as inline code chips. */
function renderHint(template: string, command: string) {
  const [before, after] = template.split('{command}');
  return (
    <Fragment>
      {before}
      <LabCodeHint>{command}</LabCodeHint>
      {after}
    </Fragment>
  );
}

export function IncidentHistory({ incidents, translations }: IncidentHistoryProps) {
  const t = translations.lab;

  if (!incidents?.length) {
    return (
      <LabEmptyState
        icon={ShieldAlert}
        title={t.empty.incidentsTitle}
        description={t.empty.incidentsDescription}
        hint={renderHint(t.empty.tryCommand, 'chaos latency')}
      />
    );
  }

  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{
        borderRadius: 'var(--lab-radius-md)',
        border: '1px solid var(--md-sys-color-outline-variant)',
        bgcolor: 'var(--md-sys-color-surface-container-lowest)',
      }}
    >
      <Table size="small" aria-label={t.incidentTable.ariaLabel}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: 72, fontWeight: 700 }}>{t.incidentTable.status}</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>{t.incidentTable.type}</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>{t.incidentTable.duration}</TableCell>
            <TableCell align="right" sx={{ fontWeight: 700 }}>
              {t.incidentTable.timestamp}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {incidents.map((incident) => {
            const { icon: Icon, color } = statusConfig[incident.status];
            return (
              <TableRow
                key={incident.id}
                hover
                sx={{ '&:last-child td': { border: 0 } }}
                aria-label={`${incident.type}, ${incident.status}, ${incident.duration}`}
              >
                <TableCell>
                  <Tooltip title={incident.status}>
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                      <Icon size={18} style={{ color }} aria-hidden />
                    </Box>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {incident.type}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{incident.duration}</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="caption" sx={{ color: 'var(--md-sys-color-on-surface-variant)' }} suppressHydrationWarning>
                    {incident.timestamp.toLocaleString()}
                  </Typography>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
