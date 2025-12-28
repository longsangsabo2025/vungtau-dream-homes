import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface SkeletonCardProps {
  className?: string;
}

export function PropertyCardSkeleton({ className }: SkeletonCardProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl bg-card border animate-pulse",
        className
      )}
    >
      {/* Image skeleton */}
      <div className="relative aspect-[4/3] bg-muted">
        <Skeleton className="h-full w-full" />
        {/* Badge skeletons */}
        <div className="absolute top-3 left-3 flex gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        {/* Heart button skeleton */}
        <Skeleton className="absolute top-3 right-3 h-9 w-9 rounded-full" />
      </div>

      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Price */}
        <Skeleton className="h-7 w-32" />
        
        {/* Title */}
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-3/4" />
        
        {/* Location */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-40" />
        </div>
        
        {/* Features */}
        <div className="flex items-center gap-4 pt-2">
          <div className="flex items-center gap-1">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-8" />
          </div>
          <div className="flex items-center gap-1">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-8" />
          </div>
          <div className="flex items-center gap-1">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-12" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function PropertyListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <PropertyCardSkeleton key={i} />
      ))}
    </div>
  );
}
