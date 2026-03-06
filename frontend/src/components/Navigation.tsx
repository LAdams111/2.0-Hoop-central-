import { useState, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { Search, Menu, X } from "lucide-react";
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
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a0a]/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4">
        <Link href="/">
          <a className="flex items-center gap-2 font-display text-xl font-semibold uppercase tracking-tight">
            <span className="flex h-8 w-8 items-center justify-center rounded bg-orange-500 text-white">
              🏀
            </span>
            <span className="text-white">Hoop</span>
            <span className="text-orange-500">Central</span>
          </a>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {NAV_LINKS.map(({ href, label }) => (
            <Link key={href} href={href}>
              <a
                className={cn(
                  "font-display text-sm font-medium uppercase tracking-wide transition",
                  location === href || (href !== "/" && location.startsWith(href))
                    ? "text-orange-500 underline decoration-orange-500 underline-offset-4"
                    : "text-zinc-400 hover:text-white"
                )}
              >
                {label}
              </a>
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <form onSubmit={handleSearchSubmit} className="hidden items-center gap-2 md:flex">
            <Input
              type="search"
              placeholder="Search players or teams..."
              className="w-64 bg-white/5"
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
            />
            <Button type="submit" size="icon" variant="default">
              <Search className="h-4 w-4" />
            </Button>
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
        <div className="border-t border-white/10 px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-2">
            {NAV_LINKS.map(({ href, label }) => (
              <Link key={href} href={href}>
                <a
                  className={cn(
                    "block py-2 font-display uppercase",
                    location === href ? "text-orange-500" : "text-zinc-300"
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
