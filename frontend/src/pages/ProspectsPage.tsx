import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Flame, Eye } from "lucide-react";
import { QueryError } from "@/components/QueryError";
import type { Player } from "@/types/api";

const NBA_HEADSHOT = "https://cdn.nba.com/headshots/nba/latest/1040x760";

function headshotUrl(p: Player): string | null {
  if (p.headshotUrl) return p.headshotUrl;
  if (p.sr_player_id) return `${NBA_HEADSHOT}/${p.sr_player_id}.png`;
  return null;
}

function displayName(p: Player): string {
  return p.name || p.full_name || [p.first_name, p.last_name].filter(Boolean).join(" ") || "Unknown";
}

function ageFromBirthDate(birthDate: string | undefined): number | null {
  if (!birthDate) return null;
  const d = new Date(birthDate);
  if (Number.isNaN(d.getTime())) return null;
  const today = new Date();
  let a = today.getFullYear() - d.getFullYear();
  const m = today.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < d.getDate())) a -= 1;
  return a;
}

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
        <Flame className="h-7 w-7 shrink-0 text-primary" />
        <h1 className="font-display text-4xl font-bold uppercase tracking-tight md:text-5xl">
          <span
            className="bg-gradient-to-r from-primary to-amber-400 bg-clip-text text-transparent"
          >
            Hottest
          </span>
          {" "}
          <span className="rounded-md bg-gradient-to-r from-primary to-amber-400 px-2 py-0.5 text-white">
            Prospects
          </span>
        </h1>
      </div>
      <p className="text-muted-foreground">Top 50 most viewed players under 20.</p>

      {isError ? (
        <QueryError
          message={error instanceof Error ? error.message : "Failed to load prospects."}
          onRetry={() => refetch()}
        />
      ) : isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="flex animate-pulse items-center gap-4 rounded-xl border border-border bg-card/50 px-4 py-4"
            >
              <div className="h-10 w-8 rounded bg-muted" />
              <div className="h-14 w-14 shrink-0 rounded-full bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-5 w-32 rounded bg-muted" />
                <div className="h-3 w-48 rounded bg-muted" />
              </div>
              <div className="h-4 w-12 rounded bg-muted" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {players.map((player, index) => {
            const rank = index + 1;
            const headshot = headshotUrl(player);
            const age = ageFromBirthDate(player.birth_date);
            const team = player.team || "—";
            const position = player.position || "—";

            return (
              <Link key={player.id} href={`/players/${player.id}`}>
                <a className="block group">
                  <div className="flex items-center gap-4 rounded-xl border border-border bg-card px-4 py-4 transition-colors hover:border-primary/50 hover:shadow-md">
                    <span className="font-display text-2xl font-bold text-muted-foreground tabular-nums md:text-3xl">
                      {rank}
                    </span>
                    <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-muted">
                      {headshot ? (
                        <img
                          src={headshot}
                          alt={displayName(player)}
                          className="h-full w-full object-cover object-top"
                          loading="lazy"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none";
                            (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
                          }}
                        />
                      ) : null}
                      <div
                        className={headshot ? "hidden h-full w-full items-center justify-center bg-muted" : "flex h-full w-full items-center justify-center bg-muted"}
                      >
                        <span className="text-xl font-display font-bold uppercase text-muted-foreground">
                          ?
                        </span>
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-lg font-bold uppercase tracking-tight text-foreground transition-colors group-hover:text-primary md:text-xl">
                        {displayName(player)}
                      </p>
                      <p className="mt-0.5 text-xs font-mono uppercase tracking-wider text-muted-foreground">
                        {team} • {position}
                      </p>
                    </div>
                    {age != null && (
                      <span className="shrink-0 text-sm text-muted-foreground">Age {age}</span>
                    )}
                    <div className="flex shrink-0 items-center gap-1.5 text-sm text-muted-foreground">
                      <Eye className="h-4 w-4 text-primary" />
                      <span className="font-mono tabular-nums">
                        {(player.profileViews ?? 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </a>
              </Link>
            );
          })}
        </div>
      )}

      {!isLoading && players.length === 0 && (
        <p className="py-12 text-center text-muted-foreground">No prospects found.</p>
      )}
    </div>
  );
}
