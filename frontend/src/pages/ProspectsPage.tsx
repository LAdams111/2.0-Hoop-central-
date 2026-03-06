import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Flame } from "lucide-react";
import { PlayerCard } from "@/components/PlayerCard";
import { PlayerCardSkeleton } from "@/components/ui/skeleton";
import { QueryError } from "@/components/QueryError";
import type { Player } from "@/types/api";

export function ProspectsPage() {
  const { data, isLoading, isError, error, refetch } = useQuery<{ players?: Player[] }>({
    queryKey: ["/api/players?prospects=true&limit=50"],
  });

  const players = data?.players ?? (Array.isArray(data) ? data : []) as Player[];

  return (
    <div className="space-y-8">
      <Link href="/">
        <a className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
          ← Back to Home
        </a>
      </Link>
      <div className="flex items-center gap-2">
        <Flame className="h-6 w-6 text-primary" />
        <h1 className="font-display text-4xl font-bold uppercase tracking-tight">
          <span className="text-muted-foreground">Hottest</span>{" "}
          <span className="text-primary">Prospects</span>
        </h1>
      </div>
      <p className="text-muted-foreground">Top 50 most viewed players under 20.</p>

      {isError ? (
        <QueryError message={error instanceof Error ? error.message : "Failed to load prospects."} onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <PlayerCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {players.map((p, i) => (
            <div key={p.id} className="relative">
              <span className="absolute left-2 top-2 z-10 font-mono text-lg font-semibold text-muted-foreground">
                {i + 1}
              </span>
              <PlayerCard player={p} />
            </div>
          ))}
        </div>
      )}
      {!isLoading && players.length === 0 && (
        <p className="py-12 text-center text-muted-foreground">No prospects found.</p>
      )}
    </div>
  );
}
