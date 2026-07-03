'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import {
  GitCommit,
  Wrench,
  Beaker,
  Server,
  Rocket,
  CheckCircle2,
  XCircle,
  Loader,
  CircleDashed,
  Forward,
  Activity,
  Layers,
} from 'lucide-react';
import type { PipelineStage } from '@/lib/types';
import { LabEmptyState, LabCodeHint } from '@/components/lab/md3/lab-empty-state';
import { pipelineStatusMd3 } from '@/components/lab/md3/lab-md3-tokens';

const stageIcons: Record<string, React.ElementType> = {
  Source: GitCommit,
  Build: Wrench,
  Test: Beaker,
  'Deploy Staging': Server,
  'Deploy Canary': Forward,
  'Deploy Green': Layers,
  'Deploy Prod': Rocket,
};

interface VisualDeployPipelineProps {
  pipelineStages: PipelineStage[];
}

export function VisualDeployPipeline({ pipelineStages }: VisualDeployPipelineProps) {
  if (!pipelineStages?.length) {
    return (
      <LabEmptyState
        icon={Activity}
        title="No pipeline stages"
        description="Start a deployment to see the CI/CD pipeline in action."
        hint={<>Try <LabCodeHint>deploy --strategy=canary</LabCodeHint> in the terminal.</>}
      />
    );
  }

  const completedCount = pipelineStages.filter((s) => s.status === 'Success').length;

  return (
    <Box sx={{ width: '100%' }}>
      <Box
        role="progressbar"
        aria-label="Pipeline progress"
        aria-valuemin={0}
        aria-valuemax={pipelineStages.length}
        aria-valuenow={completedCount}
        sx={{
          display: 'flex',
          height: 6,
          width: '100%',
          borderRadius: 0,
          overflow: 'hidden',
          bgcolor: 'var(--md-sys-color-surface-container-highest)',
          mb: 3,
          gap: '2px',
        }}
      >
        {pipelineStages.map((stage) => (
          <Box
            key={stage.name}
            aria-label={`${stage.name}: ${stage.status}`}
            sx={{
              flex: 1,
              bgcolor: pipelineStatusMd3[stage.status],
              opacity: stage.status === 'Queued' ? 0.35 : 1,
              animation: stage.status === 'In Progress' ? 'pulse 1.5s ease-in-out infinite' : 'none',
              transition: 'background-color 0.4s ease',
            }}
          />
        ))}
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', lg: 'repeat(6, 1fr)' },
          gap: 2,
        }}
      >
        {pipelineStages.map((stage) => {
          const Icon = stageIcons[stage.name] ?? Activity;
          const color = pipelineStatusMd3[stage.status];
          const StatusIcon = {
            Success: CheckCircle2,
            'In Progress': Loader,
            Failed: XCircle,
            Queued: CircleDashed,
          }[stage.status];

          return (
            <Tooltip key={stage.name} title={stage.details} arrow placement="top">
              <Box
                component="button"
                type="button"
                aria-label={`${stage.name}: ${stage.status}, ${stage.duration}`}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 0.5,
                  p: 1,
                  border: 'none',
                  bgcolor: 'transparent',
                  cursor: 'default',
                  color,
                  borderRadius: 'var(--lab-radius-md)',
                  '&:hover': { bgcolor: 'var(--md-sys-color-surface-container-high)' },
                }}
              >
                <Icon size={20} aria-hidden />
                <Typography variant="caption" sx={{ fontWeight: 700, textAlign: 'center', color: 'var(--md-sys-color-on-surface)' }}>
                  {stage.name}
                </Typography>
                <Typography variant="caption" sx={{ color: 'var(--md-sys-color-on-surface-variant)' }}>
                  {stage.duration}
                </Typography>
                <StatusIcon size={12} style={{ opacity: 0.8 }} aria-hidden />
              </Box>
            </Tooltip>
          );
        })}
      </Box>
    </Box>
  );
}
