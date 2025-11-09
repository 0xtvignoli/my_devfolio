"use client"

import type { Incident } from "@/lib/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface IncidentHistoryProps {
    incidents: Incident[];
}

const statusConfig = {
    'Resolved': { icon: CheckCircle, color: 'text-green-500' },
    'Investigating': { icon: AlertTriangle, color: 'text-yellow-500' }
};

export function IncidentHistory({ incidents }: IncidentHistoryProps) {
    if (incidents.length === 0) {
        return (
            <div className="text-center text-muted-foreground dark:text-muted-foreground py-8">
                <p>No incidents recorded yet.</p>
                <p className="text-sm">Trigger a chaos experiment to see the system&apos;s resilience in action.</p>
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
                            return (
                                <TableRow key={incident.id}>
                                    <TableCell>
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div className="flex items-center justify-center">
                                                   <Icon className={`h-5 w-5 ${color}`} />
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
