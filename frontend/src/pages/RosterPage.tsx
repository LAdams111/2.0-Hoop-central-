import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Heart } from "lucide-react";
import { PlayerCard } from "@/components/PlayerCard";
import { PlayerCardSkeleton } from "@/components/ui/skeleton";
import { QueryError } from "@/components/QueryError";
import { Button } from "@/components/ui/button";
import { toggleTeamFavorite, useFavoritesSnapshot } from "@/lib/favorites";
import type { Player } from "@/types/api";

const NBA_LOGO = "https://cdn.nba.com/logos/nba";
const TEAM_IDS: Record<string, string> = {
  "Los Angeles Lakers": "14",
  "Boston Celtics": "2",
  "Golden State Warriors": "10",
  "Chicago Bulls": "5",
  "Houston Rockets": "11",
  "Miami Heat": "16",
  "Dallas Mavericks": "7",
  "Milwaukee Bucks": "17",
  "Philadelphia 76ers": "23",
  "Denver Nuggets": "8",
};

export function RosterPage() {
  const params = useParams();
  const team = params.team as string | undefined;
  const season = params.season as string | undefined;
  const seasonParam = season?.replace("-", "-") ?? "2025-26";
  const { teamKeys } = useFavoritesSnapshot();

  const { data: rosterData, isLoading, isError, error, refetch } = useQuery<{ players?: Player[] }>({
    queryKey: team ? [`/api/teams/${encodeURIComponent(team)}/roster/${seasonParam}`] : ["__noop"],
    enabled: !!team,
  });

  const players = (rosterData?.players ?? []).sort(
    (a, b) => (a.jerseyNumber ?? 99) - (b.jerseyNumber ?? 99)
  );

  const isFavTeam = team && seasonParam ? teamKeys.includes(`${team}|${seasonParam}`) : false;
  const handleToggleFavoriteTeam = () => team && toggleTeamFavorite(team, seasonParam);

  const teamId = TEAM_IDS[team ?? ""] ?? "14";
  const logoUrl = `${NBA_LOGO}/${teamId}/primary/L/logo.svg`;

  return (
    <div className="space-y-8">
      <Link href="/leagues/NBA">
        <a className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-orange-500">
          <ArrowLeft className="h-4 w-4" /> Back
        </a>
      </Link>

      <div className="flex flex-col items-center gap-4 text-center md:flex-row md:text-left">
        <img src={logoUrl} alt="" className="h-20 w-20 object-contain" />
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-white md:text-4xl">
            {team}
          </h1>
          <p className="mt-1 text-zinc-500">Team roster</p>
        </div>
        <div className="ml-auto">
          <label className="text-sm text-zinc-500">Select season</label>
          <select
            defaultValue={seasonParam}
            onChange={(e) => {
              const s = e.target.value;
              window.location.href = `/roster/${encodeURIComponent(team ?? "")}/${s}`;
            }}
            className="mt-1 block rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-orange-500 focus:outline-none"
          >
            <option value="2025-26">2025-26 Season</option>
            <option value="2024-25">2024-25 Season</option>
            <option value="2023-24">2023-24 Season</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold uppercase text-white">
          {seasonParam} season roster
        </h2>
        <Button variant="outline" size="sm" onClick={handleToggleFavoriteTeam}>
          <Heart className={`mr-2 h-4 w-4 ${isFavTeam ? "fill-orange-500 text-orange-500" : ""}`} /> Favorite team
        </Button>
      </div>

      {isError ? (
        <QueryError message={error instanceof Error ? error.message : "Failed to load roster."} onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <PlayerCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {players.map((p) => (
            <PlayerCard key={p.id} player={p} />
          ))}
        </div>
      )}
      {!isLoading && players.length === 0 && (
        <p className="py-12 text-center text-zinc-500">No players on roster.</p>
      )}
    </div>
  );
}
