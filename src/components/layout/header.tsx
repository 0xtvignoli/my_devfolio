
"use client";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { MainNav } from "./main-nav";
import { Code2 } from "lucide-react";
import { Breadcrumbs } from "./breadcrumbs";
import React from "react";
import { Skeleton } from "../ui/skeleton";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Header() {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  return (
    <>
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm md:justify-end">
       <Sheet>
        <SheetTrigger asChild>
           <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
  <SheetContent side="left" className="p-0 w-64 bg-sidebar border-sidebar-border text-sidebar-foreground">
     {/* Accessible title/description for Sheet (Radix Dialog) */}
     <SheetTitle className="sr-only">Main navigation</SheetTitle>
     <SheetDescription className="sr-only">Use this panel to navigate between sections of the site.</SheetDescription>
           <div className="h-16 flex items-center px-4 border-b border-sidebar-border">
            <Link href="/" className="flex items-center gap-3">
                <Code2 className="h-8 w-8 text-primary" />
                <h1 className="text-xl font-bold font-headline text-sidebar-active-foreground">
                    DevFolio
                </h1>
            </Link>
           </div>
           <div className="p-4">
            <MainNav />
           </div>
        </SheetContent>
      </Sheet>
      <ThemeToggle />
    </header>
    {!isHomePage && (
      <div className="hidden border-b p-4 md:block">
        <React.Suspense fallback={<Skeleton className="h-6 w-1/2" />}>
          <Breadcrumbs />
        </React.Suspense>
      </div>
    )}
    </>
  );
}
