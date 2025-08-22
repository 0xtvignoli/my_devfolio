
"use client";

import React, { useEffect, useRef, useState } from "react";
import { useDevopsSim } from "@/providers/devops-sim-provider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LogLevel } from "@/lib/types";
import { ScrollArea } from "../ui/scroll-area";
import { ChevronRight, CornerDownLeft } from "lucide-react";
import { Button } from "../ui/button";

const levelStyles: Record<LogLevel, string> = {
  INFO: "text-blue-400",
  WARN: "text-yellow-400",
  ERROR: "text-red-400",
  DEBUG: "text-gray-500",
};

const commandSuggestions = ["get services", "get pods", "clear", "help"];

type LogViewerProps = {
    activeTab: "prod-workload" | "ai-scenario";
}

export function LogViewer({ activeTab }: LogViewerProps) {
  const { logs, scenarioLogs, runCommand, isBusy } = useDevopsSim();
  const viewportRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isScenarioLog = activeTab === "ai-scenario";
  const displayedLogs = isScenarioLog ? scenarioLogs : logs;

  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, [displayedLogs]);

  const handleCommandSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isBusy || !inputValue.trim()) return;
    runCommand(inputValue.trim());
    setInputValue("");
  };
  
  const handleSuggestionClick = (command: string) => {
    if(isBusy) return;
    setInputValue(command);
     if (inputRef.current) {
      inputRef.current.focus();
      setTimeout(() => {
        runCommand(command);
        setInputValue("");
      }, 50)
    }
  }

  return (
    <Card className="flex flex-col h-full max-h-[40vh]">
      <CardHeader>
        <CardTitle>{isScenarioLog ? "Scenario Log Stream" : "Interactive Terminal"}</CardTitle>
        <CardDescription>
          {isScenarioLog ? "Live logs from the AI-generated pipeline run." : "Simulated shell for interacting with the production environment."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col overflow-hidden">
        <ScrollArea className="flex-1" viewportRef={viewportRef}>
          <div
            className="p-4 font-mono text-sm"
          >
            {displayedLogs.map((log, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row sm:gap-x-4"
              >
                {log.command === "prompt" ? (
                  <div className="flex w-full items-center">
                     <span className="text-green-400">~/prod-workload</span>
                     <ChevronRight className="h-4 w-4 text-green-400" />
                     <span className="flex-1 break-all text-foreground">{log.message}</span>
                  </div>
                ) : (
                  <>
                    <span className="text-muted-foreground whitespace-nowrap hidden sm:inline">
                      {isMounted ? log.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit'}) : '00:00:00'}
                    </span>
                    <span className={cn("font-bold", levelStyles[log.level])}>
                      [{log.level}]
                    </span>
                    <span className="whitespace-pre-wrap break-all flex-1 text-foreground">
                      {log.message}
                    </span>
                  </>
                )}
              </div>
            ))}
            {isBusy && !isScenarioLog && (
                 <div className="flex items-center gap-2 pt-2">
                    <div className="h-4 w-4 border-2 border-dashed border-foreground rounded-full animate-spin"></div>
                    <span>Executing...</span>
                </div>
            )}
          </div>
        </ScrollArea>
        {!isScenarioLog && (
            <div className="mt-4 flex flex-col gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-muted-foreground">Suggestions:</span>
                    {commandSuggestions.map(cmd => (
                        <Button key={cmd} size="sm" variant="outline" onClick={() => handleSuggestionClick(cmd)} disabled={isBusy}>
                            {cmd}
                        </Button>
                    ))}
                </div>
                <form onSubmit={handleCommandSubmit} className="relative">
                <ChevronRight className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-400 pointer-events-none" />
                <input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    disabled={isBusy}
                    placeholder="Type a command..."
                    className="w-full bg-background border rounded-md p-2 pl-10 font-mono text-sm focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2" disabled={isBusy}>
                    <CornerDownLeft className="h-5 w-5 text-muted-foreground hover:text-foreground" />
                </button>
                </form>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
