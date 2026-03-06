import { useSearch } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Search as SearchIcon, Filter } from "lucide-react";
import { PlayerCard } from "@/components/PlayerCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlayerCardSkeleton } from "@/components/ui/skeleton";
import { QueryError } from "@/components/QueryError";
import type { Player } from "@/types/api";

const POSITIONS = ["All Positions", "PG", "SG", "SF", "PF", "C", "G", "F", "G-F", "F-G", "F-C", "C-F"];

export function PlayersPage() {
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const search = params.get("search") ?? "";
  const position = params.get("position") ?? "";

  const queryUrl = `/api/players?${new URLSearchParams({
    ...(search && { search }),
    ...(position && position !== "All Positions" && { position }),
  }).toString()}`;

  const { data, isLoading, isError, error, refetch } = useQuery<{ players?: Player[] }>({
    queryKey: [queryUrl],
  });

  const players = data?.players ?? (Array.isArray(data) ? data : []) as Player[];

  const setParam = (key: string, value: string) => {
    const p = new URLSearchParams(searchString);
    if (value) p.set(key, value);
    else p.delete(key);
    window.history.replaceState(null, "", `${window.location.pathname}?${p.toString()}`);
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl font-bold uppercase tracking-tight">
          <span className="text-zinc-400">Player</span>{" "}
          <span className="text-orange-500">Directory</span>
        </h1>
        <p className="mt-2 text-zinc-500">
          Browse the complete roster. Filter by position or search by name to find specific athlete stats.
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <form
          className="flex flex-1 gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const q = (e.currentTarget.querySelector('input[name="search"]') as HTMLInputElement)?.value ?? "";
            setParam("search", q);
          }}
        >
          <SearchIcon className="h-5 w-5 shrink-0 text-zinc-500" />
          <Input
            name="search"
            placeholder="Search player name..."
            defaultValue={search}
            className="flex-1 bg-white/5"
          />
          <Button type="submit">Search</Button>
        </form>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-zinc-500" />
          <select
            value={position || "All Positions"}
            onChange={(e) => setParam("position", e.target.value === "All Positions" ? "" : e.target.value)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-orange-500 focus:outline-none"
          >
            {POSITIONS.map((p) => (
              <option key={p} value={p === "All Positions" ? "" : p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isError ? (
        <QueryError message={error instanceof Error ? error.message : "Failed to load players."} onRetry={() => refetch()} />
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
        <p className="py-12 text-center text-zinc-500">No players found.</p>
      )}
    </div>
  );
}
