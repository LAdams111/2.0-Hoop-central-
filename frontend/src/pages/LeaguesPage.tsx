import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Globe } from "lucide-react";
import { LeagueCardSkeleton } from "@/components/ui/skeleton";
import { QueryError } from "@/components/QueryError";
import type { League } from "@/types/api";

const LEAGUES: League[] = [
  { id: 1, name: "NBA", type: "Professional", description: "The National Basketball Association - the premier professional basketball league in the world." },
  { id: 2, name: "NBA G League", type: "Professional", description: "The official minor league organization of the NBA." },
  { id: 3, name: "NCAA Division I", type: "Collegiate", description: "The highest level of intercollegiate athletics sanctioned by the NCAA." },
];

const INTERNATIONAL_LEAGUES: { name: string; type?: string; description: string }[] = [
  { name: "EuroLeague", type: "Professional", description: "The top-tier European professional basketball club competition." },
  { name: "Liga ACB", type: "Professional", description: "Spain's premier professional basketball league." },
  { name: "NBL Australia", type: "Professional", description: "Australian National Basketball League." },
  { name: "FIBA", type: "Professional", description: "International competitions and national teams." },
];

export function LeaguesPage() {
  const { data: leagues = LEAGUES, isLoading, isError, error, refetch } = useQuery<League[]>({
    queryKey: ["/api/leagues"],
    placeholderData: LEAGUES,
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl font-bold uppercase tracking-tight text-foreground">
          Leagues
        </h1>
        <p className="mt-2 text-muted-foreground">Browse leagues and explore team rosters.</p>
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
        <div className="space-y-10">
          <div className="space-y-4">
            {(Array.isArray(leagues) ? leagues : LEAGUES).map((league) => (
              <Link key={league.id} href={`/leagues/${encodeURIComponent(league.name)}`}>
                <a className="block rounded-xl border border-border bg-card p-6 transition hover:border-primary/50">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-medium uppercase text-primary">
                        {league.type ?? "League"}
                      </p>
                      <h2 className="mt-1 font-display text-2xl font-bold uppercase text-foreground">
                        {league.name}
                      </h2>
                      {league.description && (
                        <p className="mt-2 text-sm text-muted-foreground">{league.description}</p>
                      )}
                    </div>
                    <ChevronRight className="h-6 w-6 shrink-0 text-primary" />
                  </div>
                </a>
              </Link>
            ))}
          </div>

          <div>
            <div className="mb-4 flex items-center gap-2">
              <Globe className="h-6 w-6 text-primary" />
              <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-foreground">
                International
              </h2>
            </div>
            <p className="mb-4 text-sm text-muted-foreground">
              Professional basketball leagues from around the globe.
            </p>
            <div className="space-y-4">
              {INTERNATIONAL_LEAGUES.map((league) => (
                <Link key={league.name} href={`/leagues/${encodeURIComponent(league.name)}`}>
                  <a className="block rounded-xl border border-border bg-card p-6 transition hover:border-primary/50">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-medium uppercase text-primary">
                          {league.type ?? "Professional"}
                        </p>
                        <h2 className="mt-1 font-display text-2xl font-bold uppercase text-foreground">
                          {league.name}
                        </h2>
                        <p className="mt-2 text-sm text-muted-foreground">{league.description}</p>
                      </div>
                      <ChevronRight className="h-6 w-6 shrink-0 text-primary" />
                    </div>
                  </a>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
