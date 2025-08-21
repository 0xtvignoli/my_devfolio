
"use client";

import { motion } from "framer-motion";
import React from "react";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { usePathname } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

export default function Template({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isHomePage = pathname === '/';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ ease: "easeInOut", duration: 0.5 }}
      className="flex-1 flex flex-col"
    >
       {!isHomePage && (
         <div className="p-4 border-b md:hidden">
            <React.Suspense fallback={<Skeleton className="h-6 w-1/2" />}>
                <Breadcrumbs />
            </React.Suspense>
         </div>
       )}
       <div className="p-4 sm:p-6 lg:p-8 flex-1">
         {children}
       </div>
    </motion.div>
  );
}
