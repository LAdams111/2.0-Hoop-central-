import { Link } from "wouter";
import { Ruler, Scale } from "lucide-react";
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

function firstName(p: Player): string {
  if (p.first_name) return p.first_name;
  const name = playerDisplayName(p);
  const lastSpace = name.lastIndexOf(" ");
  return lastSpace > 0 ? name.slice(0, lastSpace) : name;
}

function lastName(p: Player): string {
  if (p.last_name) return p.last_name;
  const name = playerDisplayName(p);
  const lastSpace = name.lastIndexOf(" ");
  return lastSpace > 0 ? name.slice(lastSpace + 1) : "";
}

function headshotUrl(p: Player): string | null {
  if (p.headshotUrl) return p.headshotUrl;
  if (p.sr_player_id) return `${NBA_HEADSHOT}/${p.sr_player_id}.png`;
  return null;
}

export function PlayerCard({ player, className }: PlayerCardProps) {
  const headshot = headshotUrl(player);
  const team = player.team || "—";
  const position = player.position || "—";
  const jersey = player.jerseyNumber != null ? `#${player.jerseyNumber}` : null;
  const height = player.height || "—";
  const weight = player.weight || "—";
  const first = firstName(player);
  const last = lastName(player);

  return (
    <Link href={`/players/${player.id}`}>
      <a className={cn("block group", className)}>
        <div className="rounded-2xl border border-border bg-card p-0 overflow-hidden transition hover:-translate-y-px hover:border-primary/50 hover:shadow-[0_4px_20px_hsl(var(--color-primary)/0.08)]">
          <div className="relative aspect-[4/5] overflow-hidden rounded-t-2xl bg-muted">
            {headshot ? (
              <>
                <img
                  src={headshot}
                  alt={playerDisplayName(player)}
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
              <span className="absolute bottom-2 left-2 rounded-lg bg-primary px-2 py-1 text-xs font-semibold uppercase tracking-wide text-primary-foreground">
                {position}
              </span>
            )}
          </div>
          <div className="p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground font-body">
              {team}
            </p>
            <h3 className="mt-1 flex flex-col gap-0">
              <span className="font-display text-xl font-bold uppercase tracking-tight text-foreground group-hover:text-primary">
                {first}
              </span>
              {last && (
                <span className="font-body text-base font-semibold uppercase tracking-tight text-foreground">
                  {last}
                </span>
              )}
            </h3>
            {(height !== "—" || weight !== "—") && (
              <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-border pt-3 font-mono text-xs text-muted-foreground">
                {height !== "—" && (
                  <span className="flex items-center gap-1.5">
                    <Ruler className="h-3.5 w-3.5 text-muted-foreground/80" />
                    {height}
                  </span>
                )}
                {weight !== "—" && (
                  <span className="flex items-center gap-1.5">
                    <Scale className="h-3.5 w-3.5 text-muted-foreground/80" />
                    {weight}
                  </span>
                )}
              </p>
            )}
            <p className="mt-2 text-xs text-muted-foreground">View profile →</p>
          </div>
        </div>
      </a>
    </Link>
  );
}
