import type { PipelineStage, Pod } from '@/lib/types';

/** MD3 color tokens for pipeline stage statuses. */
export const pipelineStatusMd3: Record<PipelineStage['status'], string> = {
  Success: 'var(--md-sys-color-tertiary)',
  'In Progress': 'var(--md-sys-color-primary)',
  Failed: 'var(--md-sys-color-error)',
  Queued: 'var(--md-sys-color-outline)',
};

/** MD3 color tokens for pod statuses. */
export const podStatusMd3: Record<Pod['status'], { color: string; bgcolor: string }> = {
  Running: {
    color: 'var(--md-sys-color-tertiary)',
    bgcolor: 'var(--md-sys-color-tertiary-container)',
  },
  Pending: {
    color: 'var(--md-sys-color-warning)',
    bgcolor: 'var(--md-sys-color-warning-container)',
  },
  Error: {
    color: 'var(--md-sys-color-error)',
    bgcolor: 'var(--md-sys-color-error-container)',
  },
};
