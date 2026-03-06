import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { QueryError } from "@/components/QueryError";
import { useState } from "react";

const NBA_LOGO = "https://cdn.nba.com/logos/nba";
const TEAM_IDS: Record<string, string> = {
  "Atlanta Hawks": "1",
  "Boston Celtics": "2",
  "Brooklyn Nets": "3",
  "Charlotte Hornets": "4",
  "Chicago Bulls": "5",
  "Cleveland Cavaliers": "6",
  "Dallas Mavericks": "7",
  "Denver Nuggets": "8",
  "Detroit Pistons": "9",
  "Golden State Warriors": "10",
  "Houston Rockets": "11",
  "Indiana Pacers": "12",
  "LA Clippers": "13",
  "Los Angeles Lakers": "14",
  "Memphis Grizzlies": "15",
  "Miami Heat": "16",
  "Milwaukee Bucks": "17",
  "Minnesota Timberwolves": "18",
  "New Orleans Pelicans": "19",
  "New York Knicks": "20",
  "Oklahoma City Thunder": "21",
  "Orlando Magic": "22",
  "Philadelphia 76ers": "23",
  "Phoenix Suns": "24",
  "Portland Trail Blazers": "25",
  "Sacramento Kings": "26",
  "San Antonio Spurs": "27",
  "Toronto Raptors": "28",
  "Utah Jazz": "29",
  "Washington Wizards": "30",
};

interface TeamRow {
  id: number;
  name: string;
  abbreviation?: string;
  season?: string;
}

export function LeagueDetailPage() {
  const params = useParams();
  const league = params.league as string | undefined;
  const [teamSearch, setTeamSearch] = useState("");

  const { data: teamsData, isLoading, isError, error, refetch } = useQuery<{ teams?: TeamRow[] }>({
    queryKey: [`/api/leagues/${encodeURIComponent(league ?? "")}/teams`],
    placeholderData: { teams: [] },
  });

  const teams = teamsData?.teams ?? [];
  const filtered = teamSearch
    ? teams.filter((t) =>
        t.name.toLowerCase().includes(teamSearch.toLowerCase())
      )
    : teams;

  return (
    <div className="space-y-8">
      <Link href="/leagues">
        <a className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary">
          <ArrowLeft className="h-4 w-4" /> Back
        </a>
      </Link>

      <div>
        <p className="text-xs font-medium uppercase text-primary">Professional</p>
        <h1 className="font-display text-4xl font-bold uppercase tracking-tight text-foreground">
          {league ?? "League"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          The National Basketball Association - the premier professional basketball league in the world.
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-display text-xl font-semibold uppercase text-foreground">
          Teams {teams.length ? `${filtered.length} of ${teams.length}` : ""}
        </h2>
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search teams..."
            value={teamSearch}
            onChange={(e) => setTeamSearch(e.target.value)}
            className="pl-9 bg-secondary border-border"
          />
        </div>
      </div>

      {isError ? (
        <QueryError message={error instanceof Error ? error.message : "Failed to load teams."} onRetry={() => refetch()} />
      ) : isLoading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {filtered.map((team) => {
            const tid = TEAM_IDS[team.name] || String(team.id);
            const logoUrl = `${NBA_LOGO}/${tid}/primary/L/logo.svg`;
            const season = team.season ?? "2025-26";
            return (
              <Link
                key={team.id}
                href={`/roster/${encodeURIComponent(team.name)}/${season.replace("-", "-")}`}
              >
                <a className="block rounded-xl border border-border bg-card p-4 transition hover:border-primary/50">
                  <p className="text-xs text-muted-foreground">{league}</p>
                  <p className="mt-1 font-display font-semibold uppercase text-foreground">
                    {team.name}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">{season}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <img
                      src={logoUrl}
                      alt=""
                      className="h-10 w-10 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                    <span className="text-primary">→</span>
                  </div>
                </a>
              </Link>
            );
          })}
        </div>
      )}
      {!isLoading && filtered.length === 0 && (
        <p className="py-12 text-center text-muted-foreground">No teams found.</p>
      )}
    </div>
  );
}
