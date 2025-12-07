'use client';

import { Bar, BarChart, Cell, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import type { DeploymentData } from '@/lib/types';
import { memo } from 'react';

const chartConfig = {
  count: {
    label: "Count",
  },
  success: {
    label: "Success",
    color: "hsl(var(--primary))",
  },
  failure: {
    label: "Failure",
    color: "hsl(var(--destructive))",
  }
};

interface DeploymentStatusChartProps {
  data: DeploymentData[];
}

export const DeploymentStatusChart = memo(function DeploymentStatusChart({ data }: DeploymentStatusChartProps) {
  return (
    <ChartContainer config={chartConfig} className="w-full h-auto">
      <div style={{ width: '100%', height: '300px', minWidth: 0, display: 'flex' }} className="sm:h-[250px] lg:h-[300px]">
        <ResponsiveContainer width="100%" height="100%" minWidth={0}>
          <BarChart 
            data={data} 
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            syncId="perf-sync"
          >
            <ChartTooltip
                content={<ChartTooltipContent hideLabel />}
                cursor={false}
            />
            <Bar dataKey="count" radius={2}>
                {data.map((d, index) => (
                    <Cell key={`cell-${index}`} fill={d.status === 'success' ? 'hsl(var(--primary))' : 'hsl(var(--destructive))'} />
                ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartContainer>
  );
}, (prev, next) => {
  return prev.data === next.data;
});
