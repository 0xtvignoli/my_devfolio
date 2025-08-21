
import { Skeleton } from "@/components/ui/skeleton";

export function HeaderSkeleton() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm md:justify-end">
        <Skeleton className="h-8 w-8 md:hidden" />
        <Skeleton className="h-8 w-8" />
    </header>
  );
}
