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
        <div className="rounded-xl border border-white/10 bg-[#141414] p-4 transition hover:border-orange-500/50 hover:bg-white/[0.03]">
          <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-white/5 mb-3">
            {headshot ? (
              <img
                src={headshot}
                alt={name}
                className="h-full w-full object-cover object-top"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-zinc-600">
                <span className="text-4xl font-display uppercase">?</span>
              </div>
            )}
            {jersey && (
              <span className="absolute right-2 top-2 text-5xl font-display font-bold text-white/20">
                {player.jerseyNumber}
              </span>
            )}
            {position && position !== "—" && (
              <span className="absolute bottom-2 left-2 rounded bg-orange-500 px-2 py-0.5 text-xs font-semibold uppercase text-white">
                {position}
              </span>
            )}
          </div>
          <p className="text-xs font-medium uppercase text-orange-500">{team}</p>
          <h3 className="mt-1 font-display text-lg font-semibold uppercase tracking-tight text-white group-hover:text-orange-500">
            {name}
          </h3>
          {(height !== "—" || weight !== "—") && (
            <p className="mt-2 font-mono text-xs text-zinc-500">
              {height} {weight}
            </p>
          )}
          <p className="mt-2 text-xs text-zinc-500">View profile →</p>
        </div>
      </a>
    </Link>
  );
}
