import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton", className)} aria-hidden />;
}

export function ProductCardSkeleton() {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4">
      <Skeleton className="mb-3 h-32 w-full rounded-xl" />
      <Skeleton className="mb-2 h-4 w-3/4" />
      <Skeleton className="mb-4 h-3 w-1/2" />
      <Skeleton className="h-10 w-full rounded-xl" />
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-4">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-4 flex-1" />
      <Skeleton className="h-6 w-20 rounded-full" />
    </div>
  );
}
