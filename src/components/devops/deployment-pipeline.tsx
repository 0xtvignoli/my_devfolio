
"use client";

import React from "react";
import { useDevopsSim } from "@/providers/devops-sim-provider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle, CircleDashed, Loader, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PipelineStage } from "@/lib/types";

const statusIcons: Record<PipelineStage["status"], React.ReactNode> = {
  pending: <CircleDashed className="h-6 w-6 text-muted-foreground" />,
  running: <Loader className="h-6 w-6 animate-spin text-primary" />,
  success: <CheckCircle className="h-6 w-6 text-green-500" />,
  failure: <XCircle className="h-6 w-6 text-destructive" />,
};

export function DeploymentPipeline() {
  const { pipeline } = useDevopsSim();

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Deployment Pipeline</CardTitle>
        <CardDescription>Live status of the latest deployment</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto pb-2">
          <div className="flex items-start">
            {pipeline.map((stage, index) => (
              <React.Fragment key={stage.name}>
                <div className="flex flex-col items-center gap-2 text-center basis-0 grow">
                  {statusIcons[stage.status]}
                  <div className="flex flex-col items-center">
                    <span className="text-sm font-medium whitespace-normal">
                      {stage.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {stage.duration ? `${stage.duration}s` : " "}
                    </span>
                  </div>
                </div>
                {index < pipeline.length - 1 && (
                  <div className="flex-1 shrink-0">
                    <div
                      className={cn(
                        "mt-3 h-px w-full",
                        stage.status === "success" ? "bg-green-500" : "bg-border"
                      )}
                    />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
