"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPopper, type Instance, type Placement, type Modifier } from "@popperjs/core";
import ReactDOM from "react-dom";

export interface PopperProps {
  anchor: HTMLElement | null;
  open: boolean;
  placement?: Placement;
  offset?: [number, number];
  strategy?: "fixed" | "absolute";
  className?: string;
  children: React.ReactNode;
  modifiers?: Modifier<any, any>[];
  withArrow?: boolean;
  elevation?: "sm" | "md" | "lg";
  radius?: string; // tailwind radius class e.g. 'rounded-md'
  tone?: "default" | "inverted";
}

// Lightweight popper wrapper. Renders nothing server-side; positions after mount.
export const Popper: React.FC<PopperProps> = ({
  anchor,
  open,
  placement = "bottom-start",
  offset = [0, 8],
  strategy = "absolute",
  className = "",
  children,
  modifiers = [],
  withArrow = true,
  elevation = "md",
  radius = "rounded-md",
  tone = "default"
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const arrowRef = useRef<HTMLDivElement | null>(null);
  const popperInstance = useRef<Instance | null>(null);
  const [, forceUpdate] = useState(0); // trigger rerender once mounted

  useEffect(() => {
    if (!open) return () => {};
    if (!anchor || !ref.current) return () => {};
    // Create instance
  popperInstance.current = createPopper(anchor, ref.current, {
      placement,
      strategy,
      modifiers: [
        { name: "offset", options: { offset } },
        { name: "preventOverflow", options: { padding: 8 } },
        { name: "flip", options: { fallbackPlacements: ["bottom-start", "top-start", "right", "left"] } },
        ...(withArrow ? [{
          name: 'arrow',
          enabled: true,
          phase: 'main',
          fn: () => {}, // core arrow logic handled internally by popper's bundled arrow modifier; placeholder to satisfy type
          options: { element: arrowRef.current, padding: 6 }
        } as unknown as Modifier<'arrow', any>] : []),
        ...modifiers,
      ],
    });
    // Update on next tick (fonts/layout)
    requestAnimationFrame(() => {
      popperInstance.current?.update();
      forceUpdate(x => x + 1);
    });
    return () => {
      popperInstance.current?.destroy();
      popperInstance.current = null;
    };
  }, [open, anchor, placement, strategy, JSON.stringify(offset), JSON.stringify(modifiers)]);

  // Recompute when window resizes
  useEffect(() => {
    if (!open) return;
    const handler = () => popperInstance.current?.update();
    window.addEventListener("resize", handler);
    window.addEventListener("scroll", handler, true);
    return () => {
      window.removeEventListener("resize", handler);
      window.removeEventListener("scroll", handler, true);
    };
  }, [open]);

  if (typeof document === "undefined") return null; // SSR guard
  if (!open) return null;

  const elevationMap = {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-xl'
  } as const;
  const toneClasses = tone === 'inverted'
    ? 'bg-foreground text-background border-border'
    : 'bg-popover/95 backdrop-blur supports-[backdrop-filter]:bg-popover/80 text-popover-foreground border-border';
  const panel = (
    <div
      ref={ref}
      className={`z-50 ${radius} border ${toneClasses} ${elevationMap[elevation]} transition-opacity transition-transform duration-150 data-[enter]:opacity-100 data-[enter]:scale-100 opacity-0 scale-95 will-change-transform ${className}`}
      role="dialog"
      aria-modal="false"
    >
      {children}
      {withArrow && <div ref={arrowRef} className="popper-arrow" data-popper-arrow />}
    </div>
  );
  return ReactDOM.createPortal(panel, document.body);
};

// Basic arrow styling (can be overridden by global styles / tailwind plugin)
// Using a style tag ensures presence without manual CSS file.
if (typeof document !== 'undefined' && !document.getElementById('popper-arrow-styles')) {
  const style = document.createElement('style');
  style.id = 'popper-arrow-styles';
  style.innerHTML = `.popper-arrow { width: 10px; height: 10px; position: absolute; pointer-events: none; }
  .popper-arrow:before { content: ''; position: absolute; width: 10px; height: 10px; transform: rotate(45deg); background: inherit; border: inherit; top:0; left:0; }
  [data-popper-placement^='top'] > .popper-arrow { bottom: -5px; }
  [data-popper-placement^='bottom'] > .popper-arrow { top: -5px; }
  [data-popper-placement^='left'] > .popper-arrow { right: -5px; }
  [data-popper-placement^='right'] > .popper-arrow { left: -5px; }`;
  document.head.appendChild(style);
}
