'use client';

import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import type { TimeSeriesData } from '@/lib/types';

const chartConfig = {
  usage: {
    label: "Memory Usage (%)",
    color: "hsl(var(--accent))",
  },
};

interface MemoryUsageChartProps {
  data: TimeSeriesData[];
}

export function MemoryUsageChart({ data }: MemoryUsageChartProps) {
  return (
    <ChartContainer config={chartConfig} className="w-full h-auto min-h-[200px]">
      <div className="w-full h-[200px] sm:h-[250px] lg:h-[300px] min-w-0">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <AreaChart accessibilityLayer data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
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
}
