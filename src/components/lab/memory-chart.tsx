'use client';

import { Area, AreaChart } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LabChartShell } from '@/components/lab/md3/lab-chart-shell';
import type { TimeSeriesData } from '@/lib/types';
import { memo } from 'react';

const chartConfig = {
  usage: {
    label: 'Memory Usage (%)',
    color: 'var(--md-sys-color-primary)',
  },
};

interface MemoryUsageChartProps {
  data: TimeSeriesData[];
  compact?: boolean;
}

export const MemoryUsageChart = memo(
  function MemoryUsageChart({ data, compact = false }: MemoryUsageChartProps) {
    return (
      <LabChartShell compact={compact} aria-label="Memory usage chart">
        <ChartContainer config={chartConfig} className="h-full w-full min-h-0 aspect-auto">
          <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} syncId="perf-sync">
            <ChartTooltip
              content={<ChartTooltipContent indicator="dot" hideLabel />}
              cursor={{ stroke: 'var(--md-sys-color-primary)', strokeWidth: 1, strokeDasharray: '3 3' }}
            />
            <Area
              type="monotone"
              dataKey="usage"
              stroke="var(--color-usage)"
              strokeWidth={2}
              fill="none"
              isAnimationActive={false}
            />
          </AreaChart>
        </ChartContainer>
      </LabChartShell>
    );
  },
  (prev, next) => prev.data === next.data && prev.compact === next.compact
);
