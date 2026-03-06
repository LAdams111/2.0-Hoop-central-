import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-xl bg-card/50 border border-border", className)}
      aria-hidden
    />
  );
}

export function PlayerCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <Skeleton className="aspect-[4/5] w-full rounded-lg" />
      <Skeleton className="mt-3 h-3 w-16" />
      <Skeleton className="mt-2 h-5 w-3/4" />
      <Skeleton className="mt-2 h-3 w-full" />
    </div>
  );
}

export function LeagueCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="mt-2 h-7 w-32" />
      <Skeleton className="mt-2 h-4 w-full" />
    </div>
  );
}
