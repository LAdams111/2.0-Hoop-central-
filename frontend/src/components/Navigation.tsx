import { useState, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { Search, Menu, X, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/leagues", label: "Leagues" },
  { href: "/prospects", label: "Prospects" },
  { href: "/birth-year", label: "Birth Year" },
  { href: "/international", label: "International" },
  { href: "/players", label: "Directory" },
  { href: "/favorites", label: "Favorites" },
];

export function Navigation() {
  const [location, setLocation] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");

  const handleSearchSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (searchQ.trim()) {
        setLocation(`/players?search=${encodeURIComponent(searchQ.trim())}`);
        setSearchQ("");
        setMobileOpen(false);
      }
    },
    [searchQ, setLocation]
  );

  return (
    <header className="sticky top-0 z-50 h-16 border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-4 px-4">
        <Link href="/">
          <a className="flex items-center gap-2 font-display text-xl font-semibold uppercase tracking-tight">
            <span className="flex h-8 w-8 items-center justify-center rounded bg-primary text-primary-foreground">
              <Trophy className="h-4 w-4" />
            </span>
            <span
              className="text-white"
              style={{
                WebkitTextStroke: "2px black",
                paintOrder: "stroke fill",
              }}
            >
              Hoop
            </span>
            <span className="text-primary">Central</span>
          </a>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map(({ href, label }) => (
            <Link key={href} href={href}>
              <a
                className={cn(
                  "text-sm font-medium uppercase tracking-wide transition font-body",
                  location === href || (href !== "/" && location.startsWith(href))
                    ? "text-primary underline decoration-primary underline-offset-4"
                    : "text-muted-foreground hover:text-primary"
                )}
              >
                {label}
              </a>
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <form onSubmit={handleSearchSubmit} className="hidden items-center gap-2 md:flex">
            <div className="flex w-full max-w-sm items-center overflow-hidden rounded-full border-2 border-foreground bg-white shadow-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
              <Search className="ml-4 h-4 w-4 shrink-0 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search players or teams..."
                className="w-48 flex-1 border-0 bg-transparent py-2 pl-2 pr-2 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 md:w-56"
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
              />
              <Button type="submit" size="icon" className="mr-1 h-8 w-8 shrink-0 rounded-full">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </form>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-border px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-2">
            {NAV_LINKS.map(({ href, label }) => (
              <Link key={href} href={href}>
                <a
                  className={cn(
                    "block py-2 font-body text-sm font-medium uppercase tracking-wide",
                    location === href ? "text-primary" : "text-muted-foreground"
                  )}
                  onClick={() => setMobileOpen(false)}
                >
                  {label}
                </a>
              </Link>
            ))}
          </nav>
          <form onSubmit={handleSearchSubmit} className="mt-4 flex gap-2">
            <Input
              type="search"
              placeholder="Search players..."
              className="bg-secondary border-border"
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
            />
            <Button type="submit">Search</Button>
          </form>
        </div>
      )}
    </header>
  );
}
