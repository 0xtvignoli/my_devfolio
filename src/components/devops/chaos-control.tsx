
"use client";

import { useDevopsSim } from "@/providers/devops-sim-provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { AlertTriangle, ShieldCheck, Zap } from "lucide-react";

export function ChaosControl() {
  const { incident, availableExperiments, services, runCommand, isBusy } = useDevopsSim();

  const isIncidentInProgress = incident !== null;

  if (isIncidentInProgress) {
    return (
      <Button variant="destructive" disabled className="w-full sm:w-auto">
        <ShieldCheck className="mr-2 h-4 w-4 animate-pulse" />
        Incident in Progress...
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full sm:w-auto" disabled={isBusy}>
          <AlertTriangle className="mr-2 h-4 w-4 text-yellow-500" />
          Run Chaos Experiment
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Select Experiment</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {availableExperiments.map((exp) => (
          <DropdownMenuSub key={exp.type}>
            <DropdownMenuSubTrigger>
              <Zap className="mr-2 h-4 w-4" />
              <span>{exp.name}</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuLabel>Select Target Service</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {services.map((service) => (
                  <DropdownMenuItem
                    key={service.id}
                    onClick={() => runCommand("run chaos", { experiment: exp, service })}
                    disabled={isBusy}
                  >
                    {service.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
