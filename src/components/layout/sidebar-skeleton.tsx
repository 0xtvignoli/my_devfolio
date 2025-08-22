import { Skeleton } from '@/components/ui/skeleton';

export function SidebarSkeleton() {
  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 border-r border-sidebar-border bg-sidebar text-sidebar-foreground p-4">
      <div className="h-16 flex items-center mb-4">
        <Skeleton className="h-8 w-8 mr-3" />
        <Skeleton className="h-6 w-32" />
      </div>
      <div className="space-y-2 flex-1">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
      <div className="border-t border-sidebar-border pt-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="h-6 w-24" />
        </div>
      </div>
    </aside>
  );
}
