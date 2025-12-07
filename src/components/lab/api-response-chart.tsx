'use client';

import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import type { TimeSeriesData } from '@/lib/types';
import { memo } from 'react';

const chartConfig = {
  p95: {
    label: "P95 Latency (ms)",
    color: "hsl(var(--primary))",
  },
};

interface ApiResponseTimeChartProps {
  data: TimeSeriesData[];
}

export const ApiResponseTimeChart = memo(function ApiResponseTimeChart({ data }: ApiResponseTimeChartProps) {
  return (
    <ChartContainer config={chartConfig} className="w-full h-auto">
      <div style={{ width: '100%', height: '300px', minWidth: 0, display: 'flex' }} className="sm:h-[250px] lg:h-[300px]">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            syncId="perf-sync"
          >
            <defs>
              <linearGradient id="colorApi" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-p95)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-p95)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <ChartTooltip
              content={<ChartTooltipContent indicator="dot" />}
              cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '3 3' }}
            />
            <Area
              type="monotone"
              dataKey="p95"
              stroke="var(--color-p95)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorApi)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  );
}, (prev, next) => {
  return prev.data === next.data;
});
