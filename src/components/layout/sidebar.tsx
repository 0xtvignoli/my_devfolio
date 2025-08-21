
"use client";

import { MainNav } from "@/components/layout/main-nav";
import { Code2 } from "lucide-react";
import Link from "next/link";

export function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="h-16 flex items-center px-4 border-b border-sidebar-border">
        <Link href="/" className="flex items-center gap-3">
          <Code2 className="h-8 w-8 text-primary" />
          <h1 className="text-xl font-bold font-headline text-sidebar-active-foreground">
            DevFolio
          </h1>
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <MainNav />
      </div>
    </aside>
  );
}
