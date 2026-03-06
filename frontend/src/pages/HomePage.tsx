import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Zap, Users, Search, Trophy, Building2, Heart } from "lucide-react";
import { PlayerCard } from "@/components/PlayerCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlayerCardSkeleton } from "@/components/ui/skeleton";
import { QueryError } from "@/components/QueryError";
import { useFavoritesSnapshot } from "@/lib/favorites";
import type { Player } from "@/types/api";

export function HomePage() {
  const [, setLocation] = useLocation();
  const { playerIds } = useFavoritesSnapshot();

  const { data: featuredIds } = useQuery<string[]>({
    queryKey: ["/api/site-settings/featured_players"],
    placeholderData: [],
  });
  const idsParam = featuredIds?.length ? `ids=${featuredIds.join(",")}` : "limit=8";
  const {
    data: playersData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: [`/api/players?${idsParam}`],
    enabled: true,
  });
  const players = (playersData as { players?: Player[] } | undefined)?.players ?? (Array.isArray(playersData) ? playersData : []) as Player[];

  const favoritesQueryUrl =
    playerIds.length > 0 ? `/api/players?ids=${playerIds.slice(0, 12).join(",")}` : null;
  const { data: favoritesData } = useQuery({
    queryKey: favoritesQueryUrl ? [favoritesQueryUrl] : ["__noop"],
    enabled: !!favoritesQueryUrl,
  });
  const favoritePlayers = (favoritesData as { players?: Player[] } | undefined)?.players ?? (Array.isArray(favoritesData) ? favoritesData : []) as Player[];
  const orderedFavorites = playerIds
    .slice(0, 12)
    .map((id) => favoritePlayers.find((p) => p.id === id))
    .filter(Boolean) as Player[];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = (e.currentTarget.querySelector('input[name="search"]') as HTMLInputElement)?.value?.trim();
    if (q) setLocation(`/players?search=${encodeURIComponent(q)}`);
  };

  return (
    <div className="space-y-16">
      <section className="relative flex min-h-[80vh] flex-col items-center justify-center text-center">
        {/* Subtle light orange grid overlay - matches Replit */}
        <div
          className="absolute inset-0 bg-[length:24px_24px] opacity-60"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--primary) / 0.08) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary) / 0.08) 1px, transparent 1px)`,
          }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.12),transparent)]" aria-hidden />
        <p className="relative mb-2 flex items-center justify-center gap-2 text-sm font-medium uppercase tracking-wide text-primary">
          <Zap className="h-4 w-4" />
          Real-time stats
        </p>
        <h1 className="relative font-display text-5xl font-bold uppercase tracking-tight md:text-7xl">
          <span
            className="text-white"
            style={{
              WebkitTextStroke: "2px black",
              paintOrder: "stroke fill",
            }}
          >
            Hoop
          </span>
          {" "}
          <span className="text-primary text-glow">Central</span>
        </h1>
        <p className="relative mx-auto mt-4 max-w-xl text-muted-foreground">
          The ultimate database for modern basketball stats. Track performance of the biggest stars and hottest prospects.
        </p>
        <form
          className="relative mx-auto mt-8 flex w-full max-w-xl items-center gap-0 rounded-full border-2 border-foreground bg-white/5 shadow-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20"
          onSubmit={handleSearch}
        >
          <Search className="relative left-4 h-5 w-5 shrink-0 text-muted-foreground" />
          <Input
            name="search"
            placeholder="Search players or teams..."
            className="min-w-0 flex-1 rounded-full border-0 bg-transparent py-3 pl-3 pr-2 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <Button type="submit" size="icon" className="mr-1.5 h-9 w-9 shrink-0 rounded-full">
            →
          </Button>
        </form>
      </section>

      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard icon={<Users className="h-5 w-5 text-primary" />} value="1,012+" label="Active Players" />
        <StatCard icon={<Search className="h-5 w-5 text-primary" />} value="1.2k" label="Active Scouts" />
        <StatCard icon={<Trophy className="h-5 w-5 text-primary" />} value="75" label="Seasons Tracked" />
        <StatCard icon={<Building2 className="h-5 w-5 text-primary" />} value="30+" label="Teams" />
      </section>

      {playerIds.length > 0 && (
        <section>
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-center gap-2">
              <Heart className="h-6 w-6 text-primary" />
              <h2 className="font-display text-3xl font-bold uppercase tracking-tight text-foreground md:text-4xl">
                Favorites
              </h2>
            </div>
            <Link href="/favorites">
              <a className="text-sm font-medium text-primary hover:underline">View all →</a>
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-4 md:grid-cols-5">
            {orderedFavorites.slice(0, 4).map((p) => (
              <PlayerCard key={p.id} player={p} />
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold uppercase tracking-tight md:text-4xl">
              <span className="text-foreground">Most</span>{" "}
              <span className="text-primary">Viewed</span>
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">Trending athletes this week.</p>
          </div>
          <Link href="/players">
            <a className="text-sm font-medium text-primary hover:underline">Explore trends →</a>
          </Link>
        </div>
        {isError ? (
          <QueryError message={error instanceof Error ? error.message : "Failed to load players."} onRetry={() => refetch()} />
        ) : isLoading ? (
          <div className="grid grid-cols-3 gap-4 md:grid-cols-5">
            {[1, 2, 3, 4].map((i) => (
              <PlayerCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4 md:grid-cols-5">
            {(players as Player[]).slice(0, 8).map((p) => (
              <PlayerCard key={p.id} player={p} />
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold uppercase tracking-tight md:text-4xl">
              <span className="text-foreground">Featured</span>{" "}
              <span className="text-primary">Athletes</span>
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">Top performers from the current season.</p>
          </div>
          <Link href="/players">
            <a className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-4 py-2 text-sm hover:bg-secondary">
              View all players →
            </a>
          </Link>
        </div>
        {!isLoading && (players as Player[])?.length > 8 && (
          <div className="grid grid-cols-3 gap-4 md:grid-cols-5">
            {(players as Player[]).slice(8, 12).map((p) => (
              <PlayerCard key={p.id} player={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </span>
      <div>
        <p className="font-mono text-3xl font-bold tracking-tight text-foreground">{value}</p>
        <p className="mt-0.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
