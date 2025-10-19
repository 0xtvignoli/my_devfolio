"use client";

import React from "react";

// Simple animated aurora/gradient background using Tailwind utilities
// Renders behind page content (positioned absolutely with negative z-index)
export function AuroraBackground(): JSX.Element {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-32 -left-32 h-[40rem] w-[40rem] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.25)_0%,rgba(99,102,241,0)_60%)] blur-2xl" />
      <div className="absolute -bottom-40 -right-48 h-[46rem] w-[46rem] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.25)_0%,rgba(16,185,129,0)_60%)] blur-3xl" />
      <div className="absolute top-1/3 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(236,72,153,0.2)_0%,rgba(236,72,153,0)_60%)] blur-3xl" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background" />
    </div>
  );
}

export default AuroraBackground;