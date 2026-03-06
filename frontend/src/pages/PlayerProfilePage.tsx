import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { ArrowLeft, Heart, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatsChart } from "@/components/StatsChart";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { togglePlayerFavorite, useFavoritesSnapshot } from "@/lib/favorites";
import type { Player, PlayerStats } from "@/types/api";

const NBA_HEADSHOT = "https://cdn.nba.com/headshots/nba/latest/1040x760";

export function PlayerProfilePage() {
  const params = useParams();
  const id = params.id as string | undefined;
  const { data: player, isLoading, isError, refetch } = useQuery<Player>({
    queryKey: id ? [`/api/players/${id}`] : ["__noop"],
    enabled: !!id,
  });

  useEffect(() => {
    if (!id) return;
    fetch(`/api/players/${id}/view`, { method: "POST" }).catch(() => {});
  }, [id]);

  const { playerIds } = useFavoritesSnapshot();
  const isFav = id ? playerIds.includes(Number(id)) : false;
  const handleToggleFavorite = () => id && togglePlayerFavorite(Number(id));

  if (!id) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        <Link href="/players"><a className="text-primary hover:underline">Back to Directory</a></Link>
      </div>
    );
  }
  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }
  if (isError || !player) {
    return (
      <div className="space-y-4">
        <Link href="/players">
          <a className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4" /> Back to Directory
          </a>
        </Link>
        <div className="rounded-xl border-destructive/20 bg-destructive/5 py-12 text-center text-muted-foreground">
          Player not found.
          <Button variant="outline" size="sm" className="mt-4" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const name = player.name || player.full_name || [player.first_name, player.last_name].filter(Boolean).join(" ") || "Unknown";
  const headshot = player.headshotUrl || (player.sr_player_id ? `${NBA_HEADSHOT}/${player.sr_player_id}.png` : null);

  const stats = (player as unknown as { stats?: PlayerStats[] }).stats ?? [];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link href="/players">
          <a className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4" /> Back
          </a>
        </Link>
        <Button variant="outline" size="sm" onClick={handleToggleFavorite}>
          <Heart className={`mr-2 h-4 w-4 ${isFav ? "fill-primary text-primary" : ""}`} />
          Favorite
        </Button>
      </div>

      <div className="flex flex-col gap-8 md:flex-row">
        <div className="shrink-0">
          <div className="relative inline-block overflow-hidden rounded-xl border border-border bg-card">
            {headshot ? (
              <img src={headshot} alt={name} className="h-72 w-56 object-cover object-top" />
            ) : (
              <div className="flex h-72 w-56 items-center justify-center text-6xl font-display text-muted-foreground">?</div>
            )}
            {player.jerseyNumber != null && (
              <span className="absolute right-2 top-2 rounded bg-primary px-2 py-1 font-mono text-lg font-bold text-primary-foreground">
                #{player.jerseyNumber}
              </span>
            )}
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display text-sm font-medium uppercase text-primary">{player.team || "—"}</p>
          <h1 className="mt-1 font-display text-4xl font-bold uppercase tracking-tight text-foreground md:text-5xl">
            {name}
          </h1>
          <div className="mt-4 flex flex-wrap gap-2">
            {player.position && (
              <span className="rounded-lg border border-border bg-muted px-3 py-1.5 text-sm">Position: {player.position}</span>
            )}
            {player.height && (
              <span className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-sm">
                <span className="text-primary">HT</span> {player.height}
              </span>
            )}
            {player.weight && (
              <span className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-sm">
                <span className="text-primary">WT</span> {player.weight}
              </span>
            )}
            {player.birth_date && (
              <span className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-1.5 text-sm">
                <span className="text-primary">DOB</span> {player.birth_date}
              </span>
            )}
          </div>
          {player.birth_place && (
            <p className="mt-3">
              <span className="text-primary">Hometown</span> {player.birth_place}
            </p>
          )}
          <div className="mt-6 flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/10 px-4 py-3">
            <Eye className="h-5 w-5 text-primary" />
            <span className="font-mono text-xl font-semibold text-primary">{player.profileViews ?? 0}</span>
            <span className="text-sm uppercase text-muted-foreground">Profile views</span>
          </div>
        </div>
      </div>

      {stats.length > 0 && (
        <>
          <StatsChart stats={stats} />
          <section>
            <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-foreground">Season history</h2>
            <div className="mt-4 overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted">
                    <th className="p-3 font-display uppercase text-muted-foreground">Season</th>
                    <th className="p-3 font-display uppercase text-muted-foreground">League</th>
                    <th className="p-3 font-display uppercase text-muted-foreground">Team</th>
                    <th className="p-3 font-display uppercase text-muted-foreground">GP</th>
                    <th className="p-3 font-display uppercase text-primary">PPG</th>
                    <th className="p-3 font-display uppercase text-muted-foreground">RPG</th>
                    <th className="p-3 font-display uppercase text-muted-foreground">APG</th>
                    <th className="p-3 font-display uppercase text-muted-foreground">SPG</th>
                    <th className="p-3 font-display uppercase text-muted-foreground">BPG</th>
                    <th className="p-3 font-display uppercase text-muted-foreground">FG%</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.map((s) => (
                    <tr key={s.id} className="border-b border-border hover:bg-muted">
                      <td className="p-3 font-mono">{s.season}</td>
                      <td className="p-3">{s.league}</td>
                      <td className="p-3">
                        <Link href={`/roster/${encodeURIComponent(s.team)}/${s.season?.replace("-", "-")}`}>
                          <a className="text-primary hover:underline">{s.team}</a>
                        </Link>
                        {s.traded && <span className="ml-1 rounded bg-muted px-1 text-xs text-muted-foreground">TRADED</span>}
                      </td>
                      <td className="p-3 font-mono">{s.gamesPlayed}</td>
                      <td className="p-3 font-mono font-semibold text-primary">{s.ppg?.toFixed(1)}</td>
                      <td className="p-3 font-mono">{s.rpg?.toFixed(1)}</td>
                      <td className="p-3 font-mono">{s.apg?.toFixed(1)}</td>
                      <td className="p-3 font-mono">{s.spg?.toFixed(1)}</td>
                      <td className="p-3 font-mono">{s.bpg?.toFixed(1)}</td>
                      <td className="p-3 font-mono">{(s.fg_pct != null ? s.fg_pct * 100 : 0).toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
