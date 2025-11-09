'use client';

import { Server, Cpu, MemoryStick, CheckCircle2, AlertCircle, XCircle, Waypoints } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { KubernetesCluster } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Badge } from '../ui/badge';

const statusIcons = {
  Running: <CheckCircle2 className="text-green-500" />,
  Pending: <AlertCircle className="text-yellow-500 animate-pulse" />,
  Error: <XCircle className="text-red-500" />,
};

const statusColors = {
    Running: 'border-green-500/50 bg-green-500/10 hover:bg-green-500/20 dark:bg-green-900/20 dark:hover:bg-green-900/40',
    Pending: 'border-yellow-500/50 bg-yellow-500/10 hover:bg-yellow-500/20 dark:bg-yellow-900/20 dark:hover:bg-yellow-900/40',
    Error: 'border-red-500/50 bg-red-500/10 hover:bg-red-500/20 dark:bg-red-900/20 dark:hover:bg-red-900/40',
}

interface KubernetesClusterVizProps {
  cluster: KubernetesCluster;
}

export function KubernetesClusterViz({ cluster }: KubernetesClusterVizProps) {
  if (!cluster?.nodes) {
    return <div>Loading cluster data...</div>
  }

  return (
    <TooltipProvider delayDuration={100}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 justify-center items-start">
          {cluster.nodes.map((node) => (
            <Card key={node.name} className="bg-card/80 backdrop-blur-sm border-primary/20 w-full flex-1">
              <CardHeader className="p-4">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Server className="text-primary w-5 h-5" />
                  <span>{node.name}</span>
                </CardTitle>
                <div className="flex gap-4 text-xs text-muted-foreground dark:text-muted-foreground pt-1">
                    <div className='flex items-center gap-1'><Cpu className="w-3 h-3"/> {node.cpu}</div>
                    <div className='flex items-center gap-1'><MemoryStick className="w-3 h-3"/> {node.memory}</div>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0 grid grid-cols-2 lg:grid-cols-3 gap-2">
                {node.pods.map((pod) => (
                  <Tooltip key={pod.name}>
                    <TooltipTrigger asChild>
                      <div className={cn(
                          'border rounded-md p-2 text-center text-xs cursor-pointer transition-colors relative', 
                          statusColors[pod.status],
                           pod.isCanary && 'border-purple-500/50 bg-purple-500/10 hover:bg-purple-500/20 dark:bg-purple-900/20 dark:hover:bg-purple-900/40'
                        )}>
                        {pod.isCanary && <Badge variant="outline" className="absolute -top-2 -right-2 text-xs px-1.5 py-0.5 border-purple-500 text-purple-500">Canary</Badge>}
                        {pod.traffic !== undefined && pod.traffic > 0 && (
                            <div className="absolute top-1 left-1 flex items-center gap-1 text-primary text-[10px]">
                                <Waypoints className="w-3 h-3"/>
                                <span>{pod.traffic}%</span>
                            </div>
                        )}
                        <div className="flex justify-center mb-1">{statusIcons[pod.status]}</div>
                        <div className="font-semibold truncate">{pod.service}</div>
                        <div className="text-muted-foreground dark:text-muted-foreground truncate">{pod.name}</div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="font-code text-xs bg-card/80 backdrop-blur-sm">
                        <div className='font-bold text-base mb-2 text-primary flex items-center gap-2'>
                           {pod.name}
                           {pod.isCanary && <Badge variant="outline" className="text-xs px-1.5 py-0.5 border-purple-500 text-purple-500">Canary</Badge>}
                        </div>
                        <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-1">
                          <span className="font-semibold text-muted-foreground dark:text-muted-foreground">Service:</span> <span>{pod.service}</span>
                          <span className="font-semibold text-muted-foreground dark:text-muted-foreground">Status:</span> 
                          <span className={cn({
                              'text-green-500': pod.status === 'Running',
                              'text-red-500': pod.status === 'Error',
                              'text-yellow-500': pod.status === 'Pending'
                          })}>
                            {pod.status}
                          </span>
                           {pod.traffic !== undefined && (
                                <>
                                 <span className="font-semibold text-muted-foreground dark:text-muted-foreground">Traffic:</span> <span>{pod.traffic.toFixed(1)}%</span>
                                </>
                           )}
                        </div>
                        <hr className="my-2 border-border/50" />
                        <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-1">
                          <span className="font-semibold text-muted-foreground dark:text-muted-foreground">CPU Req:</span> <span>{pod.cpu}</span>
                          <span className="font-semibold text-muted-foreground dark:text-muted-foreground">Memory Req:</span> <span>{pod.memory}</span>
                          <span className="font-semibold text-muted-foreground dark:text-muted-foreground">IP:</span> <span>{pod.ip}</span>
                        </div>
                        <hr className="my-2 border-border/50" />
                        <div className="text-muted-foreground dark:text-muted-foreground">Type `kubectl describe pod {pod.name}` for more details.</div>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}
