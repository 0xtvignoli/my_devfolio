"use client"

import type { Incident } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, CheckCircle, ShieldAlert } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface IncidentHistoryProps {
    incidents: Incident[];
}

const statusConfig = {
    'Resolved': { icon: CheckCircle, color: 'text-green-500' },
    'Investigating': { icon: AlertTriangle, color: 'text-yellow-500' }
};

export function IncidentHistory({ incidents }: IncidentHistoryProps) {
    if (!incidents || incidents.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground dark:text-muted-foreground">
                <ShieldAlert className="h-12 w-12 mx-auto mb-4 opacity-50" aria-hidden="true" />
                <p className="text-base font-medium">No incidents recorded yet</p>
                <p className="text-sm mt-2">Incidents will appear here when chaos experiments are run.</p>
                <p className="text-xs mt-1 text-muted-foreground/70">Try running <code className="px-1 py-0.5 bg-muted rounded">chaos latency</code> in the terminal.</p>
            </div>
        )
    }

    return (
        <TooltipProvider delayDuration={100}>
            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">Status</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Duration</TableHead>
                            <TableHead className="text-right">Timestamp</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {incidents.map(incident => {
                            const Icon = statusConfig[incident.status].icon;
                            const color = statusConfig[incident.status].color;
                            const ariaLabel = `Incident: ${incident.type}, Status: ${incident.status}, Duration: ${incident.duration}, Timestamp: ${incident.timestamp.toLocaleString()}`;
                            return (
                                <TableRow key={incident.id} aria-label={ariaLabel}>
                                    <TableCell>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div className="flex items-center justify-center" aria-label={`Status: ${incident.status}`}>
                                                   <Icon className={`h-5 w-5 ${color}`} aria-hidden="true" />
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>{incident.status}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    </TableCell>
                                    <TableCell className="font-medium">{incident.type}</TableCell>
                                    <TableCell>{incident.duration}</TableCell>
                                    <TableCell className="text-right text-muted-foreground dark:text-muted-foreground text-xs">
                                        {incident.timestamp.toLocaleString()}
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </div>
        </TooltipProvider>
    )
}
