'use client';

import { Area, AreaChart } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LabChartShell } from '@/components/lab/md3/lab-chart-shell';
import type { TimeSeriesData } from '@/lib/types';
import { memo } from 'react';

const chartConfig = {
  p95: {
    label: 'P95 Latency (ms)',
    color: 'var(--md-sys-color-warning)',
  },
};

interface ApiResponseTimeChartProps {
  data: TimeSeriesData[];
  compact?: boolean;
}

export const ApiResponseTimeChart = memo(
  function ApiResponseTimeChart({ data, compact = false }: ApiResponseTimeChartProps) {
    return (
      <LabChartShell compact={compact} aria-label="API latency chart">
        <ChartContainer config={chartConfig} className="h-full w-full min-h-0 aspect-auto">
          <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} syncId="perf-sync">
            <ChartTooltip
              content={<ChartTooltipContent indicator="dot" />}
              cursor={{ stroke: 'var(--md-sys-color-warning)', strokeWidth: 1, strokeDasharray: '3 3' }}
            />
            <Area
              type="monotone"
              dataKey="p95"
              stroke="var(--color-p95)"
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
