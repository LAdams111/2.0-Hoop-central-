import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Heart } from "lucide-react";
import { PlayerCard } from "@/components/PlayerCard";
import { PlayerCardSkeleton } from "@/components/ui/skeleton";
import { QueryError } from "@/components/QueryError";
import { getFavoritePlayerIds, getFavoriteTeamKeys } from "@/lib/favorites";
import type { Player } from "@/types/api";

export function FavoritesPage() {
  const playerIds = getFavoritePlayerIds();
  const teamKeys = getFavoriteTeamKeys();

  const queryUrl =
    playerIds.length > 0 ? `/api/players?ids=${playerIds.join(",")}` : null;
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: queryUrl ? [queryUrl] : ["favorites-players-empty"],
    enabled: playerIds.length > 0,
  });
  const players = (data as { players?: Player[] } | undefined)?.players ?? (Array.isArray(data) ? data : []) as Player[];
  const orderedPlayers = playerIds
    .map((id) => players.find((p) => p.id === id))
    .filter(Boolean) as Player[];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-4xl font-bold uppercase tracking-tight text-white flex items-center gap-2">
          <Heart className="h-8 w-8 text-orange-500 fill-orange-500" />
          Favorites
        </h1>
        <p className="mt-2 text-zinc-500">
          Your saved players and teams.
        </p>
      </div>

      {playerIds.length > 0 && (
        <section>
          <h2 className="font-display text-xl font-semibold uppercase text-zinc-400 mb-4">
            Players
          </h2>
          {isError ? (
            <QueryError message={error instanceof Error ? error.message : "Failed to load."} onRetry={() => refetch()} />
          ) : isLoading ? (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <PlayerCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {orderedPlayers.map((p) => (
                <PlayerCard key={p.id} player={p} />
              ))}
            </div>
          )}
        </section>
      )}

      {teamKeys.length > 0 && (
        <section>
          <h2 className="font-display text-xl font-semibold uppercase text-zinc-400 mb-4">
            Teams
          </h2>
          <ul className="space-y-2">
            {teamKeys.map((key) => {
              const [team, season] = key.split("|");
              return (
                <li key={key}>
                  <Link href={`/roster/${encodeURIComponent(team)}/${season?.replace("-", "-") ?? "2025-26"}`}>
                    <a className="block rounded-lg border border-white/10 bg-[#141414] px-4 py-3 text-orange-500 hover:border-orange-500/50">
                      {team} — {season}
                    </a>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {playerIds.length === 0 && teamKeys.length === 0 && (
        <div className="rounded-xl border border-white/10 bg-[#141414] py-16 text-center">
          <Heart className="mx-auto h-12 w-12 text-zinc-600" />
          <p className="mt-4 text-zinc-500">No favorites yet.</p>
          <p className="mt-1 text-sm text-zinc-600">
            Favorite players from their profiles and teams from roster pages.
          </p>
          <Link href="/players">
            <a className="mt-6 inline-block text-orange-500 hover:underline">Browse players →</a>
          </Link>
        </div>
      )}
    </div>
  );
}
