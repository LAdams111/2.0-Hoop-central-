import { Link } from "wouter";
import { Globe } from "lucide-react";

const INTERNATIONAL_LEAGUES = [
  { name: "EuroLeague", description: "Top European professional clubs." },
  { name: "FIBA", description: "International competitions and national teams." },
  { name: "Liga ACB", description: "Spanish league." },
  { name: "NBL Australia", description: "Australian National Basketball League." },
];

export function InternationalPage() {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2">
        <Globe className="h-8 w-8 text-primary" />
        <div>
          <h1 className="font-display text-4xl font-bold uppercase tracking-tight text-foreground">
            International
          </h1>
          <p className="mt-2 text-muted-foreground">
            Leagues and players outside the NBA.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {INTERNATIONAL_LEAGUES.map((league) => (
          <Link key={league.name} href={`/leagues/${encodeURIComponent(league.name)}`}>
            <a className="block rounded-xl border border-border bg-card p-6 transition hover:border-primary/50">
              <p className="text-xs font-medium uppercase text-primary">{league.name}</p>
              <p className="mt-2 text-sm text-muted-foreground">{league.description}</p>
            </a>
          </Link>
        ))}
      </div>

      <p className="text-sm text-muted-foreground">
        Browse all leagues from the <Link href="/leagues"><a className="text-primary hover:underline">Leagues</a></Link> page.
      </p>
    </div>
  );
}
