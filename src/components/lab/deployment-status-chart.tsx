'use client';

import { Bar, BarChart, Cell } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LabChartShell } from '@/components/lab/md3/lab-chart-shell';
import type { DeploymentData } from '@/lib/types';
import { memo } from 'react';

const chartConfig = {
  count: { label: 'Count' },
  success: { label: 'Success', color: 'var(--md-sys-color-tertiary)' },
  failure: { label: 'Failure', color: 'var(--md-sys-color-error)' },
};

interface DeploymentStatusChartProps {
  data: DeploymentData[];
  compact?: boolean;
}

export const DeploymentStatusChart = memo(
  function DeploymentStatusChart({ data, compact = false }: DeploymentStatusChartProps) {
    return (
      <LabChartShell compact={compact} aria-label="Deployment status chart">
        <ChartContainer config={chartConfig} className="h-full w-full min-h-0 aspect-auto">
          <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} syncId="perf-sync">
            <ChartTooltip content={<ChartTooltipContent hideLabel />} cursor={false} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {data.map((d, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={d.status === 'success' ? 'var(--md-sys-color-tertiary)' : 'var(--md-sys-color-error)'}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </LabChartShell>
    );
  },
  (prev, next) => prev.data === next.data && prev.compact === next.compact
);
