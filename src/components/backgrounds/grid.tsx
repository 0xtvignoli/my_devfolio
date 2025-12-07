"use client";

import React from "react";

// Subtle grid overlay with vignette mask
export function GridBackground(): React.JSX.Element {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      <div
        className="absolute inset-0 opacity-[0.07] [background-image:linear-gradient(to_right,theme(colors.slate.500/.3)_1px,transparent_1px),linear-gradient(to_bottom,theme(colors.slate.500/.3)_1px,transparent_1px)] [background-size:24px_24px]"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
      <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_60%,transparent_100%)]" />
    </div>
  );
}

export default GridBackground;