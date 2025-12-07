'use client';

import { Line, LineChart, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import type { TimeSeriesData } from '@/lib/types';
import { memo } from 'react';

const chartConfig = {
  usage: {
    label: "CPU Usage (%)",
    color: "hsl(var(--primary))",
  },
};

interface CpuUsageChartProps {
  data: TimeSeriesData[];
}

export const CpuUsageChart = memo(function CpuUsageChart({ data }: CpuUsageChartProps) {
  return (
    <ChartContainer config={chartConfig} className="w-full h-auto">
      <div style={{ width: '100%', height: '300px', minWidth: 0, display: 'flex' }} className="sm:h-[250px] lg:h-[300px]">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <LineChart 
            data={data} 
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            syncId="perf-sync"
          >
            <ChartTooltip
              content={<ChartTooltipContent indicator="dot" hideLabel />}
              cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: '3 3' }}
            />
            <Line
              type="monotone"
              dataKey="usage"
              stroke="var(--color-usage)"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  );
}, (prev, next) => {
  // Only re-render if data actually changed
  return prev.data === next.data;
});
