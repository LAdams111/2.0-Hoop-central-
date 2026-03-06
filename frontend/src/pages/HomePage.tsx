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
      <section className="text-center">
        <p className="mb-2 flex items-center justify-center gap-2 text-sm text-orange-500/90">
          <Zap className="h-4 w-4" />
          Real-time stats
        </p>
        <h1 className="font-display text-5xl font-bold uppercase tracking-tight md:text-7xl">
          <span className="text-white">Hoop</span>
          <span className="text-orange-500">Central</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-zinc-400">
          The ultimate database for modern basketball stats. Track performance of the biggest stars and hottest prospects.
        </p>
        <form
          className="mx-auto mt-8 flex max-w-xl gap-2"
          onSubmit={handleSearch}
        >
          <Input
            name="search"
            placeholder="Search players or teams..."
            className="flex-1 bg-white/5"
          />
          <Button type="submit" size="icon" className="shrink-0 rounded-full">
            →
          </Button>
        </form>
      </section>

      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard icon={<Users className="h-5 w-5 text-orange-500" />} value="1,012+" label="Active Players" />
        <StatCard icon={<Search className="h-5 w-5 text-orange-500" />} value="1.2k" label="Active Scouts" />
        <StatCard icon={<Trophy className="h-5 w-5 text-orange-500" />} value="75" label="Seasons Tracked" />
        <StatCard icon={<Building2 className="h-5 w-5 text-orange-500" />} value="30+" label="Teams" />
      </section>

      {playerIds.length > 0 && (
        <section>
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-center gap-2">
              <Heart className="h-6 w-6 text-orange-500" />
              <h2 className="font-display text-3xl font-bold uppercase tracking-tight text-white">
                Favorites
              </h2>
            </div>
            <Link href="/favorites">
              <a className="text-sm font-medium text-orange-500 hover:underline">View all →</a>
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {orderedFavorites.slice(0, 4).map((p) => (
              <PlayerCard key={p.id} player={p} />
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold uppercase tracking-tight">
              <span className="text-zinc-400">Most</span>{" "}
              <span className="text-orange-500">Viewed</span>
            </h2>
            <p className="mt-1 text-sm text-zinc-500">Trending athletes this week.</p>
          </div>
          <Link href="/players">
            <a className="text-sm font-medium text-orange-500 hover:underline">Explore trends →</a>
          </Link>
        </div>
        {isError ? (
          <QueryError message={error instanceof Error ? error.message : "Failed to load players."} onRetry={() => refetch()} />
        ) : isLoading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <PlayerCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {(players as Player[]).slice(0, 8).map((p) => (
              <PlayerCard key={p.id} player={p} />
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-display text-3xl font-bold uppercase tracking-tight">
              <span className="text-zinc-400">Featured</span>{" "}
              <span className="text-orange-500">Athletes</span>
            </h2>
            <p className="mt-1 text-sm text-zinc-500">Top performers from the current season.</p>
          </div>
          <Link href="/players">
            <a className="inline-flex items-center gap-1 rounded-lg border border-white/10 px-4 py-2 text-sm hover:bg-white/5">
              View all players →
            </a>
          </Link>
        </div>
        {!isLoading && (players as Player[])?.length > 8 && (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
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
    <div className="rounded-xl border border-white/10 bg-[#141414] p-4">
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <p className="font-mono text-2xl font-semibold text-white">{value}</p>
          <p className="text-xs uppercase text-zinc-500">{label}</p>
        </div>
      </div>
    </div>
  );
}
