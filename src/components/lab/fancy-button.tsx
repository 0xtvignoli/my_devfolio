"use client";

import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";
import React from "react";

interface FancyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    Icon: LucideIcon;
    text: string;
    variant?: "primary" | "destructive";
}

export function FancyButton({ Icon, text, variant = "primary", className, disabled, ...props }: FancyButtonProps) {
    const isLoader = Icon.name === 'Loader2';
    return (
        <button
            className={cn(
                "ui-btn",
                variant === 'destructive' && 'destructive',
                disabled && 'opacity-50 cursor-not-allowed',
                className
            )}
            disabled={disabled}
            {...props}
        >
            <span>
                <Icon className={cn(
                    "inline-block mr-2 h-5 w-5",
                    isLoader && "animate-spin"
                )} aria-hidden="true" />
                {text}
            </span>
        </button>
    );
}
