import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight } from "lucide-react";
import { LeagueCardSkeleton } from "@/components/ui/skeleton";
import { QueryError } from "@/components/QueryError";
import type { League } from "@/types/api";

const LEAGUES: League[] = [
  { id: 1, name: "NBA", type: "Professional", description: "The National Basketball Association - the premier professional basketball league in the world." },
  { id: 2, name: "NBA G League", type: "Professional", description: "The official minor league organization of the NBA." },
  { id: 3, name: "NCAA Division I", type: "Collegiate", description: "The highest level of intercollegiate athletics sanctioned by the NCAA." },
];

export function LeaguesPage() {
  const { data: leagues = LEAGUES, isLoading, isError, error, refetch } = useQuery<League[]>({
    queryKey: ["/api/leagues"],
    placeholderData: LEAGUES,
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl font-bold uppercase tracking-tight text-white">
          Leagues
        </h1>
        <p className="mt-2 text-zinc-500">Browse leagues and explore team rosters.</p>
      </div>

      {isError ? (
        <QueryError message={error instanceof Error ? error.message : "Failed to load leagues."} onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <LeagueCardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {(Array.isArray(leagues) ? leagues : LEAGUES).map((league) => (
            <Link key={league.id} href={`/leagues/${encodeURIComponent(league.name)}`}>
              <a className="block rounded-xl border border-white/10 bg-[#141414] p-6 transition hover:border-orange-500/50">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium uppercase text-orange-500">
                      {league.type ?? "League"}
                    </p>
                    <h2 className="mt-1 font-display text-2xl font-bold uppercase text-white">
                      {league.name}
                    </h2>
                    {league.description && (
                      <p className="mt-2 text-sm text-zinc-500">{league.description}</p>
                    )}
                  </div>
                  <ChevronRight className="h-6 w-6 shrink-0 text-orange-500" />
                </div>
              </a>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
