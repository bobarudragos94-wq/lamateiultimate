import { ProductCardSkeleton, Skeleton } from "@/components/ui/skeleton";

export default function CatalogLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Skeleton className="mb-2 h-8 w-56" />
      <Skeleton className="mb-6 h-4 w-80" />
      <Skeleton className="mb-4 h-12 w-full rounded-2xl" />
      <div className="mb-6 flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-full" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
