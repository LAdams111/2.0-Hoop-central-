import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Router, Route, Switch, useLocation } from "wouter";
import { Navigation } from "@/components/Navigation";
import { AdminLock } from "@/components/AdminLock";
import { HomePage } from "@/pages/HomePage";
import { PlayersPage } from "@/pages/PlayersPage";
import { PlayerProfilePage } from "@/pages/PlayerProfilePage";
import { LeaguesPage } from "@/pages/LeaguesPage";
import { LeagueDetailPage } from "@/pages/LeagueDetailPage";
import { RosterPage } from "@/pages/RosterPage";
import { ScraperPage } from "@/pages/ScraperPage";
import { BirthYearPage } from "@/pages/BirthYearPage";
import { ProspectsPage } from "@/pages/ProspectsPage";
import { FavoritesPage } from "@/pages/FavoritesPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: async ({ queryKey }) => {
        const url = typeof queryKey[0] === "string" ? queryKey[0] : "/api/";
        const res = await fetch(url);
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      },
    },
  },
});

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground relative">
      {/* Subtle light orange grid on entire page - matches Replit */}
      <div
        className="fixed inset-0 pointer-events-none bg-[length:24px_24px] opacity-50"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--primary) / 0.06) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary) / 0.06) 1px, transparent 1px)`,
        }}
        aria-hidden
      />
      <div className="relative">
        <Navigation />
        <main className="mx-auto max-w-7xl px-4 py-8 pb-20 md:pb-8">{children}</main>
        <AdminLock />
      </div>
    </div>
  );
}

function RedirectToLeagues() {
  const [, setLocation] = useLocation();
  React.useEffect(() => setLocation("/leagues"), [setLocation]);
  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Layout>
          <Switch>
            <Route path="/" component={HomePage} />
            <Route path="/players" component={PlayersPage} />
            <Route path="/players/:id" component={PlayerProfilePage} />
            <Route path="/leagues" component={LeaguesPage} />
            <Route path="/leagues/:league" component={LeagueDetailPage} />
            <Route path="/roster/:team/:season" component={RosterPage} />
            <Route path="/scraper" component={ScraperPage} />
            <Route path="/birth-year" component={BirthYearPage} />
            <Route path="/prospects" component={ProspectsPage} />
            <Route path="/favorites" component={FavoritesPage} />
            <Route path="/international" component={RedirectToLeagues} />
            <Route>
                <div className="font-display text-2xl uppercase text-muted-foreground">Not found</div>
              </Route>
          </Switch>
        </Layout>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
