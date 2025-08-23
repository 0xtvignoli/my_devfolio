"use client";

import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";
import React from "react";

interface FancyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    Icon: LucideIcon;
    text: string;
    variant?: "primary" | "destructive";
}

export function FancyButton({ Icon, text, variant = "primary", className, ...props }: FancyButtonProps) {
    return (
        <button
            className={cn(
                "ui-btn",
                variant === 'destructive' && 'destructive',
                className
            )}
            {...props}
        >
            <span>
                <Icon className="inline-block mr-2 h-5 w-5" />
                {text}
            </span>
        </button>
    );
}
