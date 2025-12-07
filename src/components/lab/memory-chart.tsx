'use client';

import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import type { TimeSeriesData } from '@/lib/types';
import { memo } from 'react';

const chartConfig = {
  usage: {
    label: "Memory Usage (%)",
    color: "hsl(var(--accent))",
  },
};

interface MemoryUsageChartProps {
  data: TimeSeriesData[];
}

export const MemoryUsageChart = memo(function MemoryUsageChart({ data }: MemoryUsageChartProps) {
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
                <linearGradient id="colorMemory" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-usage)" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="var(--color-usage)" stopOpacity={0}/>
                </linearGradient>
            </defs>
            <ChartTooltip
              content={<ChartTooltipContent indicator="dot" hideLabel />}
              cursor={{ stroke: 'hsl(var(--accent))', strokeWidth: 1, strokeDasharray: '3 3' }}
            />
            <Area
              type="monotone"
              dataKey="usage"
              stroke="var(--color-usage)"
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorMemory)"
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
