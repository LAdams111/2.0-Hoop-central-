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
        <div className="rounded-2xl border border-border bg-card overflow-hidden p-0 transition-all duration-300 hover:-translate-y-px hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
          <div className="relative aspect-[4/5] overflow-hidden bg-muted flex-shrink-0">
            {headshot ? (
              <>
                <div className="absolute inset-0 z-10 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />
                <img
                  src={headshot}
                  alt={playerDisplayName(player)}
                  className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <span className="text-4xl font-display uppercase">?</span>
              </div>
            )}
            {jersey && (
              <span className="absolute right-2 top-2 z-20 text-xl font-display font-bold text-foreground/5 transition-colors group-hover:text-primary/10 md:right-4 md:top-4 md:text-4xl">
                #{player.jerseyNumber}
              </span>
            )}
            {position && position !== "—" && (
              <span className="absolute bottom-2 left-2 z-20 rounded-sm bg-primary px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground md:bottom-4 md:left-4 md:px-2.5 md:text-xs">
                {position}
              </span>
            )}
          </div>
          <div className="relative z-20 flex flex-1 flex-col justify-between gap-1 p-2 md:gap-3 md:p-5">
            <div className="min-h-0">
              <p className="mb-0.5 truncate text-[8px] font-mono uppercase tracking-widest text-primary md:mb-1 md:text-[10px]">
                {team}
              </p>
              <h3 className="font-display leading-tight text-foreground transition-colors line-clamp-2 group-hover:text-primary text-sm md:text-2xl">
                {last ? (
                  <>
                    {first} <span className="font-bold">{last}</span>
                  </>
                ) : (
                  <span className="font-bold">{first}</span>
                )}
              </h3>
            </div>
            {(height !== "—" || weight !== "—") && (
              <p className="mt-auto hidden flex-wrap items-center gap-x-3 gap-y-1 border-t border-border pt-3 font-mono text-[10px] text-muted-foreground whitespace-nowrap overflow-hidden md:flex">
                {height !== "—" && (
                  <span className="flex items-center gap-1.5 flex-shrink-0">
                    <Ruler className="h-3 w-3 text-primary" />
                    {height}
                  </span>
                )}
                {weight !== "—" && (
                  <span className="flex items-center gap-1.5 flex-shrink-0">
                    <Scale className="h-3 w-3 text-primary" />
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
