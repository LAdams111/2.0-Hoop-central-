import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Users, Search, Trophy, Building2, Heart, Activity, ArrowRight } from "lucide-react";
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
      <section className="relative flex min-h-[80vh] flex-col items-center justify-center overflow-visible border-b border-border/40 text-center">
        <div className="absolute inset-0 z-0 bg-background">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.1),hsl(var(--background)),hsl(var(--background)))]" />
          <div
            className="absolute inset-0 bg-[length:64px_64px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,black_70%,transparent_100%)]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)`,
            }}
            aria-hidden
          />
        </div>
        <div className="container relative z-10 px-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-mono text-primary mb-6">
            <Activity className="h-3 w-3" />
            <span>REAL-TIME STATS</span>
          </div>
          <h1 className="font-display text-7xl font-bold uppercase tracking-tighter text-foreground mb-6 md:text-9xl">
            <span
              style={{
                color: "black",
                textShadow:
                  "-2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff, 2px 2px 0 #fff, -2px 0 0 #fff, 2px 0 0 #fff, 0 -2px 0 #fff, 0 2px 0 #fff",
              }}
            >
              HOOP
            </span>
            <span className="text-primary text-glow">CENTRAL</span>
          </h1>
          <p className="font-body mx-auto mb-10 max-w-2xl text-xl text-muted-foreground md:text-2xl">
            The ultimate database for modern basketball stats. Track performance of the biggest stars and hottest prospects.
          </p>
          <form className="relative mx-auto max-w-md group z-[100]" onSubmit={handleSearch}>
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
            <Input
              name="search"
              placeholder="Search players or teams..."
              className="rounded-full border-2 border-foreground bg-white/5 py-7 pl-12 text-lg placeholder:text-muted-foreground/50 focus-visible:border-primary/50 focus-visible:ring-primary/20"
            />
            <Button type="submit" size="icon" className="absolute right-2 top-2 h-10 w-10 rounded-full">
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </section>

      <section className="border-b border-border/40 bg-card/30 py-8 backdrop-blur-sm">
        <div className="container mx-auto grid grid-cols-2 gap-8 px-4 md:grid-cols-4">
          <StatCard icon={<Users className="h-6 w-6 text-primary" />} value="1,012+" label="Active Players" />
          <StatCard icon={<Search className="h-6 w-6 text-primary" />} value="1.2k" label="Active Scouts" />
          <StatCard icon={<Trophy className="h-6 w-6 text-primary" />} value="75" label="Seasons Tracked" />
          <StatCard icon={<Building2 className="h-6 w-6 text-primary" />} value="30+" label="Teams" />
        </div>
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
            <h2 className="font-display text-4xl font-bold uppercase tracking-tight md:text-5xl">
              <span className="text-foreground">Most</span>{" "}
              <span className="text-primary text-glow">Viewed</span>
            </h2>
            <p className="mt-1 text-muted-foreground">Trending athletes this week</p>
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
            <h2 className="font-display text-4xl font-bold uppercase tracking-tight md:text-5xl">
              <span className="text-foreground">Featured</span>{" "}
              <span className="text-primary">Athletes</span>
            </h2>
            <p className="mt-1 text-muted-foreground">Top performers from the current season</p>
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
    <div className="flex items-center justify-center gap-4 group">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform group-hover:scale-110">
        {icon}
      </div>
      <div>
        <p className="font-display text-3xl font-bold text-foreground">{value}</p>
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
