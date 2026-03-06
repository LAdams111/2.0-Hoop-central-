import { Link } from "wouter";
import { cn } from "@/lib/utils";
import type { Player } from "@/types/api";

const NBA_HEADSHOT = "https://cdn.nba.com/headshots/nba/latest/1040x760";

interface PlayerCardProps {
  player: Player;
  className?: string;
}

function playerDisplayName(p: Player): string {
  return p.name || p.full_name || [p.first_name, p.last_name].filter(Boolean).join(" ") || "Unknown";
}

function headshotUrl(p: Player): string | null {
  if (p.headshotUrl) return p.headshotUrl;
  if (p.sr_player_id) return `${NBA_HEADSHOT}/${p.sr_player_id}.png`;
  return null;
}

export function PlayerCard({ player, className }: PlayerCardProps) {
  const name = playerDisplayName(player);
  const headshot = headshotUrl(player);
  const team = player.team || "—";
  const position = player.position || "—";
  const jersey = player.jerseyNumber != null ? `#${player.jerseyNumber}` : null;
  const height = player.height || "—";
  const weight = player.weight || "—";

  return (
    <Link href={`/players/${player.id}`}>
      <a className={cn("block group", className)}>
        <div className="rounded-xl border border-border bg-card p-4 transition hover:-translate-y-px hover:border-primary/50 hover:shadow-[0_4px_20px_hsl(var(--color-primary)/0.08)]">
          <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-muted">
            {headshot ? (
              <>
                <img
                  src={headshot}
                  alt={name}
                  className="h-full w-full object-cover object-top"
                />
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/40 to-transparent" />
              </>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <span className="text-4xl font-display uppercase">?</span>
              </div>
            )}
            {jersey && (
              <span className="absolute right-2 top-2 text-5xl font-display font-bold text-foreground/5 transition group-hover:text-primary/10">
                {player.jerseyNumber}
              </span>
            )}
            {position && position !== "—" && (
              <span className="absolute bottom-2 left-2 rounded bg-primary px-2 py-0.5 text-xs font-semibold uppercase text-primary-foreground">
                {position}
              </span>
            )}
          </div>
          <p className="mt-3 text-xs font-medium uppercase tracking-wide text-primary font-mono">{team}</p>
          <h3 className="mt-1 font-display text-lg font-semibold uppercase tracking-tight text-foreground group-hover:text-primary">
            {name}
          </h3>
          {(height !== "—" || weight !== "—") && (
            <p className="mt-2 border-t border-border pt-2 font-mono text-xs text-muted-foreground">
              {height} {weight}
            </p>
          )}
          <p className="mt-2 text-xs text-muted-foreground">View profile →</p>
        </div>
      </a>
    </Link>
  );
}
