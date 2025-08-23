'use client';

import React from 'react';
import {
  GitCommit,
  Wrench,
  Beaker,
  Server,
  Rocket,
  CheckCircle2,
  XCircle,
  Loader,
  CircleDashed,
  Forward,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { PipelineStage } from '@/lib/types';
import { cn } from '@/lib/utils';

const stageIcons: Record<string, React.ElementType> = {
    Source: GitCommit,
    Build: Wrench,
    Test: Beaker,
    'Deploy Staging': Server,
    'Deploy Canary': Forward,
    'Deploy Prod': Rocket,
};


interface VisualDeployPipelineProps {
    pipelineStages: PipelineStage[];
}

export function VisualDeployPipeline({ pipelineStages }: VisualDeployPipelineProps) {
  return (
    <TooltipProvider>
      <div className="w-full">
        <div className="flex h-2 w-full rounded-full overflow-hidden bg-muted mb-4 space-x-0.5">
          {pipelineStages.map((stage) => {
            const isInProgress = stage.status === 'In Progress';
            return (
              <div key={stage.name} className="flex-1 h-full transition-all duration-500">
                <div 
                  className={cn('h-full w-full', {
                    'bg-green-500': stage.status === 'Success',
                    'bg-blue-500': isInProgress,
                    'bg-muted': stage.status === 'Queued' || stage.status === 'Failed'
                  })}
                  style={isInProgress ? {
                    backgroundImage: 'linear-gradient(45deg, hsla(0,0%,100%,.15) 25%, transparent 25%, transparent 50%, hsla(0,0%,100%,.15) 50%, hsla(0,0%,100%,.15) 75%, transparent 75%, transparent)',
                    backgroundSize: '40px 40px',
                    animation: 'progress-stripes 2s linear infinite'
                  } : {}}
                />
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-3 gap-y-4 md:grid-cols-6 md:gap-y-0 text-xs">
          {pipelineStages.map((stage) => {
            const Icon = stageIcons[stage.name];
            const statusConfig = {
              'Success': 'text-green-500',
              'In Progress': 'text-blue-500 animate-pulse',
              'Failed': 'text-red-500',
              'Queued': 'text-muted-foreground'
            }[stage.status];

            const StatusIcon = {
              'Success': CheckCircle2,
              'In Progress': Loader,
              'Failed': XCircle,
              'Queued': CircleDashed
            }[stage.status];

            return (
              <Tooltip key={stage.name}>
                <TooltipTrigger asChild>
                   <div className={cn('flex flex-col items-center', statusConfig)}>
                      <Icon className="h-5 w-5 mb-1" />
                      <span className="font-semibold text-center text-foreground">{stage.name}</span>
                      <span className="text-xs">{stage.duration}</span>
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <div className="flex items-center gap-2 font-bold text-base mb-1">
                      <StatusIcon className={cn('h-4 w-4', statusConfig)} />
                      <span>{stage.name}: {stage.status}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">{stage.details}</div>
                </TooltipContent>
              </Tooltip>
            )
          })}
        </div>
      </div>
    </TooltipProvider>
  );
}
