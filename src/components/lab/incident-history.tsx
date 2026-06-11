'use client';

import type { Incident } from '@/lib/types';
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

interface IncidentHistoryProps {
  incidents: Incident[];
}

const statusConfig = {
  Resolved: { icon: CheckCircle, color: 'var(--md-sys-color-tertiary)' },
  Investigating: { icon: AlertTriangle, color: 'var(--md-sys-color-warning)' },
};

export function IncidentHistory({ incidents }: IncidentHistoryProps) {
  if (!incidents?.length) {
    return (
      <LabEmptyState
        icon={ShieldAlert}
        title="No incidents yet"
        description="Incidents appear here when chaos experiments run."
        hint={<>Try <LabCodeHint>chaos latency</LabCodeHint> in the terminal.</>}
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
      <Table size="small" aria-label="Incident history">
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: 72, fontWeight: 700 }}>Status</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Duration</TableCell>
            <TableCell align="right" sx={{ fontWeight: 700 }}>
              Timestamp
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
                  <Typography variant="caption" sx={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
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
