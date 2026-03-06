---

## Tech Stack
- React + TypeScript (Vite bundler)
- Tailwind CSS with CSS variables
- shadcn/ui component library (new-york style) with Radix UI
- wouter for routing
- TanStack React Query v5 for data fetching
- Recharts for charts
- lucide-react for icons

---

## Color System (CSS Variables — index.css)

```css
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Teko:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --font-display: 'Teko', sans-serif;
  --font-body: 'Outfit', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;

  --background: 0 0% 100%;
  --foreground: 224 71% 4%;

  --card: 0 0% 98%;
  --card-foreground: 224 71% 4%;

  --popover: 0 0% 100%;
  --popover-foreground: 224 71% 4%;

  /* Primary = Basketball Orange */
  --primary: 24 95% 53%;
  --primary-foreground: 0 0% 100%;

  --secondary: 210 40% 96.1%;
  --secondary-foreground: 222.2 47.4% 11.2%;

  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;

  /* Accent = Teal */
  --accent: 172 66% 50%;
  --accent-foreground: 224 71% 4%;

  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;

  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 24 95% 53%;

  --radius: 0.5rem;
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground antialiased font-body selection:bg-primary/30 selection:text-primary-foreground;
  }
  h1, h2, h3, h4, h5, h6 {
    font-family: var(--font-display);
    @apply font-bold tracking-wide uppercase;
  }
}

@layer utilities {
  .text-glow {
    text-shadow: 0 0 20px rgba(255, 87, 34, 0.5);
  }
  .glass-card {
    @apply bg-card/60 backdrop-blur-md border border-white/5 shadow-xl;
  }
  .stat-value {
    font-family: var(--font-mono);
  }
}

::-webkit-scrollbar { width: 8px; }
::-webkit-scrollbar-track { background: hsl(var(--background)); }
::-webkit-scrollbar-thumb { background: hsl(var(--border)); border-radius: 4px; }
::-webkit-scrollbar-thumb:hover { background: hsl(var(--primary)); }
```

---

## Tailwind Config

```typescript
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: ".5625rem",
        md: ".375rem",
        sm: ".1875rem",
      },
      colors: {
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        border: "hsl(var(--border) / <alpha-value>)",
        input: "hsl(var(--input) / <alpha-value>)",
        card: {
          DEFAULT: "hsl(var(--card) / <alpha-value>)",
          foreground: "hsl(var(--card-foreground) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "hsl(var(--popover) / <alpha-value>)",
          foreground: "hsl(var(--popover-foreground) / <alpha-value>)",
        },
        primary: {
          DEFAULT: "hsl(var(--primary) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
          foreground: "hsl(var(--secondary-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted) / <alpha-value>)",
          foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "hsl(var(--accent) / <alpha-value>)",
          foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        ring: "hsl(var(--ring) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
        serif: ["var(--font-serif)"],
        mono: ["var(--font-mono)"],
        display: ["var(--font-display)"],
        body: ["var(--font-body)"],
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
```

---

## Fonts

- **Teko** — All headings. Bold, uppercase, tight tracking (font-display)
- **Outfit** — Body text (font-body)
- **JetBrains Mono** — Stats, numbers, badges, small labels (font-mono)

---

## Constants

```typescript
export const DEFAULT_HEADSHOT = "https://cdn.nba.com/headshots/nba/latest/1040x760/1631244.png";

export const NBA_TEAMS = [
  "Atlanta Hawks", "Boston Celtics", "Brooklyn Nets", "Charlotte Hornets",
  "Chicago Bulls", "Cleveland Cavaliers", "Dallas Mavericks", "Denver Nuggets",
  "Detroit Pistons", "Golden State Warriors", "Houston Rockets", "Indiana Pacers",
  "LA Clippers", "Los Angeles Lakers", "Memphis Grizzlies", "Miami Heat",
  "Milwaukee Bucks", "Minnesota Timberwolves", "New Orleans Pelicans", "New York Knicks",
  "Oklahoma City Thunder", "Orlando Magic", "Philadelphia 76ers", "Phoenix Suns",
  "Portland Trail Blazers", "Sacramento Kings", "San Antonio Spurs", "Toronto Raptors",
  "Utah Jazz", "Washington Wizards",
];

export const G_LEAGUE_TEAMS = [
  "Austin Spurs", "Birmingham Squadron", "Capital City Go-Go", "Cleveland Charge",
  "College Park Skyhawks", "Delaware Blue Coats", "Fort Wayne Mad Ants", "Grand Rapids Gold",
  "Greensboro Swarm", "Iowa Wolves", "Lakeland Magic", "Long Island Nets",
  "Maine Celtics", "Memphis Hustle", "Mexico City Capitanes", "Motor City Cruise",
  "Oklahoma City Blue", "Osceola Magic", "Raptors 905", "Rio Grande Valley Vipers",
  "Salt Lake City Stars", "Santa Cruz Warriors", "Sioux Falls Skyforce", "South Bay Lakers",
  "Stockton Kings", "Texas Legends", "Westchester Knicks", "Windy City Bulls", "Wisconsin Herd",
];

export const EUROLEAGUE_TEAMS = [
  "Anadolu Efes Istanbul", "AS Monaco", "Baskonia Vitoria-Gasteiz", "Crvena Zvezda Belgrade",
  "Dubai Basketball", "EA7 Emporio Armani Milano", "FC Barcelona", "FC Bayern Munich",
  "Fenerbahce Beko Istanbul", "Hapoel Tel Aviv", "LDLC ASVEL Villeurbanne",
  "Maccabi Tel Aviv", "Olympiacos Piraeus", "Panathinaikos Athens", "Paris Basketball",
  "Partizan Belgrade", "Real Madrid", "Valencia Basket", "Virtus Bologna", "Zalgiris Kaunas",
];

export const LEAGUE_DEFAULT_SEASONS: Record<string, string> = {
  "NBA": "2025-26",
  "G-League": "2025-26",
  "EuroLeague": "2025-26",
};
```

---

## NBA Team IDs (for logos)

Logo URL pattern: `https://cdn.nba.com/logos/nba/{teamId}/primary/L/logo.svg`

```typescript
const NBA_TEAM_IDS: Record<string, string> = {
  "Atlanta Hawks": "1610612737",
  "Boston Celtics": "1610612738",
  "Brooklyn Nets": "1610612751",
  "Charlotte Hornets": "1610612766",
  "Chicago Bulls": "1610612741",
  "Cleveland Cavaliers": "1610612739",
  "Dallas Mavericks": "1610612742",
  "Denver Nuggets": "1610612743",
  "Detroit Pistons": "1610612765",
  "Golden State Warriors": "1610612744",
  "Houston Rockets": "1610612745",
  "Indiana Pacers": "1610612754",
  "LA Clippers": "1610612746",
  "Los Angeles Clippers": "1610612746",
  "Los Angeles Lakers": "1610612747",
  "Memphis Grizzlies": "1610612763",
  "Miami Heat": "1610612748",
  "Milwaukee Bucks": "1610612749",
  "Minnesota Timberwolves": "1610612750",
  "New Orleans Pelicans": "1610612740",
  "New York Knicks": "1610612752",
  "Oklahoma City Thunder": "1610612760",
  "Orlando Magic": "1610612753",
  "Philadelphia 76ers": "1610612755",
  "Phoenix Suns": "1610612756",
  "Portland Trail Blazers": "1610612757",
  "Sacramento Kings": "1610612758",
  "San Antonio Spurs": "1610612759",
  "Toronto Raptors": "1610612761",
  "Utah Jazz": "1610612762",
  "Washington Wizards": "1610612764",
};
```

---

## EuroLeague Logos

```typescript
const EUROLEAGUE_LOGOS: Record<string, string> = {
  "Anadolu Efes Istanbul": "https://upload.wikimedia.org/wikipedia/en/0/04/Anadolu_Efes_S.K._logo.svg",
  "AS Monaco": "https://upload.wikimedia.org/wikipedia/en/e/ea/AS_Monaco_Basket_logo.svg",
  "Baskonia Vitoria-Gasteiz": "https://upload.wikimedia.org/wikipedia/en/c/c7/Saski_Baskonia_logo.svg",
  "Crvena Zvezda Belgrade": "https://upload.wikimedia.org/wikipedia/en/2/2e/KK_Crvena_zvezda_logo.svg",
  "Dubai Basketball": "https://upload.wikimedia.org/wikipedia/en/b/bd/Dubai_Basketball_Club_logo.png",
  "EA7 Emporio Armani Milano": "https://upload.wikimedia.org/wikipedia/en/1/10/Olimpia_Milano_logo.svg",
  "FC Barcelona": "https://upload.wikimedia.org/wikipedia/en/4/47/FC_Barcelona_%28crest%29.svg",
  "FC Bayern Munich": "https://upload.wikimedia.org/wikipedia/commons/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg",
  "Fenerbahce Beko Istanbul": "https://upload.wikimedia.org/wikipedia/en/6/63/Fenerbah%C3%A7e_Beko_logo.svg",
  "Hapoel Tel Aviv": "https://upload.wikimedia.org/wikipedia/en/0/0c/Hapoel_Tel_Aviv_B.C._logo.svg",
  "LDLC ASVEL Villeurbanne": "https://upload.wikimedia.org/wikipedia/en/1/10/ASVEL_Basket_logo.svg",
  "Maccabi Tel Aviv": "https://upload.wikimedia.org/wikipedia/en/1/13/Maccabi_Tel_Aviv_B.C._logo.svg",
  "Olympiacos Piraeus": "https://upload.wikimedia.org/wikipedia/en/5/55/Olympiacos_BC_logo.svg",
  "Panathinaikos Athens": "https://upload.wikimedia.org/wikipedia/en/4/4e/Panathinaikos_BC_logo.svg",
  "Paris Basketball": "https://upload.wikimedia.org/wikipedia/en/3/30/Paris_Basketball_logo.svg",
  "Partizan Belgrade": "https://upload.wikimedia.org/wikipedia/en/e/eb/KK_Partizan_logo.svg",
  "Real Madrid": "https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg",
  "Valencia Basket": "https://upload.wikimedia.org/wikipedia/en/c/ce/Valencia_Basket_logo.svg",
  "Virtus Bologna": "https://upload.wikimedia.org/wikipedia/en/d/d8/Virtus_Bologna_logo.svg",
  "Zalgiris Kaunas": "https://upload.wikimedia.org/wikipedia/en/3/3d/BC_%C5%BDalgiris_logo.svg",
};
```

---

## G League Logos

```typescript
const G_LEAGUE_LOGOS: Record<string, string> = {
  "Austin Spurs": "https://upload.wikimedia.org/wikipedia/en/6/6c/Austin_Spurs_logo.svg",
  "Birmingham Squadron": "https://upload.wikimedia.org/wikipedia/en/1/15/Birmingham_Squadron_logo.svg",
  "Capital City Go-Go": "https://upload.wikimedia.org/wikipedia/en/8/87/Capital_City_Go-Go_logo.svg",
  "Cleveland Charge": "https://upload.wikimedia.org/wikipedia/en/b/be/Cleveland_Charge_logo.svg",
  "College Park Skyhawks": "https://upload.wikimedia.org/wikipedia/en/4/44/College_Park_Skyhawks_logo.svg",
  "Delaware Blue Coats": "https://upload.wikimedia.org/wikipedia/en/6/62/Delaware_Blue_Coats_logo.svg",
  "Grand Rapids Gold": "https://upload.wikimedia.org/wikipedia/en/8/84/Grand_Rapids_Gold_logo.svg",
  "Greensboro Swarm": "https://upload.wikimedia.org/wikipedia/en/e/e1/Greensboro_Swarm_logo.svg",
  "Iowa Wolves": "https://upload.wikimedia.org/wikipedia/en/b/b5/Iowa_Wolves_logo.svg",
  "Long Island Nets": "https://upload.wikimedia.org/wikipedia/en/f/f0/Long_Island_Nets_logo.svg",
  "Maine Celtics": "https://upload.wikimedia.org/wikipedia/en/6/65/Maine_Celtics_logo.svg",
  "Memphis Hustle": "https://upload.wikimedia.org/wikipedia/en/a/a8/Memphis_Hustle_logo.svg",
  "Mexico City Capitanes": "https://upload.wikimedia.org/wikipedia/en/e/e6/Capitanes_Ciudad_de_M%C3%A9xico_logo.svg",
  "Motor City Cruise": "https://upload.wikimedia.org/wikipedia/en/5/51/Motor_City_Cruise_logo.svg",
  "Oklahoma City Blue": "https://upload.wikimedia.org/wikipedia/en/d/d6/Oklahoma_City_Blue_logo.svg",
  "Osceola Magic": "https://upload.wikimedia.org/wikipedia/en/9/9a/Osceola_Magic_Logo.svg",
  "Raptors 905": "https://upload.wikimedia.org/wikipedia/en/4/4b/Raptors_905_logo.svg",
  "Rip City Remix": "https://upload.wikimedia.org/wikipedia/en/1/17/Rip_City_Remix_logo.svg",
  "Salt Lake City Stars": "https://upload.wikimedia.org/wikipedia/en/3/37/Salt_Lake_City_Stars_logo.svg",
  "San Diego Clippers": "https://upload.wikimedia.org/wikipedia/en/a/ac/Ontario_Clippers_logo.svg",
  "Santa Cruz Warriors": "https://upload.wikimedia.org/wikipedia/en/6/64/Santa_Cruz_Warriors_logo.svg",
  "Sioux Falls Skyforce": "https://upload.wikimedia.org/wikipedia/en/9/98/Sioux_Falls_Skyforce_logo.svg",
  "South Bay Lakers": "https://upload.wikimedia.org/wikipedia/en/9/90/South_Bay_Lakers_logo.svg",
  "Stockton Kings": "https://upload.wikimedia.org/wikipedia/en/d/d9/Stockton_Kings_logo.svg",
  "Texas Legends": "https://upload.wikimedia.org/wikipedia/en/c/c8/Texas_Legends_logo.svg",
  "Westchester Knicks": "https://upload.wikimedia.org/wikipedia/en/5/50/Westchester_Knicks_logo.svg",
  "Windy City Bulls": "https://upload.wikimedia.org/wikipedia/en/e/e5/Windy_City_Bulls_logo.svg",
  "Wisconsin Herd": "https://upload.wikimedia.org/wikipedia/en/e/e0/Wisconsin_Herd_logo.svg",
};
```

---

## Component: Navigation (Navigation.tsx)

```tsx
import { Link, useLocation } from "wouter";
import { Search, Trophy, Home, Layers, Calendar, Users, Flame } from "lucide-react";

export function Navigation() {
  const [location] = useLocation();

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Leagues", href: "/leagues" },
    { label: "Prospects", href: "/prospects" },
    { label: "Birth Year", href: "/classes" },
    { label: "Directory", href: "/players" },
  ];

  const mobileNavItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Leagues", href: "/leagues", icon: Layers },
    { label: "Prospects", href: "/prospects", icon: Flame },
    { label: "Birth Year", href: "/classes", icon: Calendar },
    { label: "Directory", href: "/players", icon: Users },
  ];

  return (
    <>
      {/* DESKTOP NAV */}
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group cursor-pointer">
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300">
              <Trophy className="w-4 h-4 text-white" />
            </div>
            <span className="font-display text-2xl font-bold tracking-widest text-foreground group-hover:text-primary transition-colors">
              HOOP<span className="text-primary">CENTRAL</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium tracking-wide uppercase transition-colors hover:text-primary relative py-1 ${
                  location === item.href ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/players">
              <button className="p-2 rounded-full hover:bg-white/5 text-muted-foreground hover:text-primary transition-colors">
                <Search className="w-5 h-5" />
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* MOBILE BOTTOM NAV */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/95 backdrop-blur-xl border-t border-border">
        <div className="flex items-center justify-around h-14">
          {mobileNavItems.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
```

---

## Component: PlayerCard (PlayerCard.tsx)

```tsx
import { Link } from "wouter";
import { type Player } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Ruler, Weight } from "lucide-react";
import { DEFAULT_HEADSHOT } from "@/lib/constants";

interface PlayerCardProps {
  player: Player;
}

export function PlayerCard({ player }: PlayerCardProps) {
  return (
    <Link href={`/players/${player.id}`} className="block group h-full">
      <Card className="min-h-full bg-card border-border hover:border-primary/50 hover:bg-card/80 transition-all duration-300 overflow-hidden relative cursor-pointer group-hover:-translate-y-1 group-hover:shadow-lg group-hover:shadow-primary/5 flex flex-col">
        
        {/* Image Container with Gradient Overlay */}
        <div className="relative aspect-[4/5] overflow-hidden bg-muted flex-shrink-0">
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10 opacity-60" />
          <img 
            src={player.headshotUrl || DEFAULT_HEADSHOT} 
            alt={player.name}
            className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_HEADSHOT; }}
          />
          
          {/* Jersey Number Badge */}
          <div className="absolute top-2 right-2 md:top-4 md:right-4 z-20 font-display text-xl md:text-4xl font-bold text-foreground/5 group-hover:text-primary/10 transition-colors">
            #{player.jerseyNumber}
          </div>
          
          {/* Position Badge */}
          <div className="absolute bottom-2 left-2 md:bottom-4 md:left-4 z-20">
            <Badge variant="secondary" className="bg-primary text-white hover:bg-primary/90 font-bold tracking-wider rounded-sm text-[10px] md:text-xs px-1.5 md:px-2.5 py-0 md:py-0.5">
              {player.position}
            </Badge>
          </div>
        </div>

        <CardContent className="p-2 md:p-5 flex flex-col flex-1 justify-between gap-1 md:gap-3 relative z-20">
          <div className="min-h-0">
            <div className="text-[8px] md:text-[10px] font-mono text-primary uppercase tracking-widest mb-0.5 md:mb-1 truncate">
              {player.team}
            </div>
            <h3 className="font-display text-sm md:text-2xl leading-tight text-foreground group-hover:text-primary transition-colors line-clamp-2">
              {(() => {
                const parts = player.name.trim().split(/\s+/);
                if (parts.length <= 1) return <span className="font-bold">{player.name}</span>;
                const lastName = parts.pop();
                return <>{parts.join(" ")} <span className="font-bold">{lastName}</span></>;
              })()}
            </h3>
          </div>
          
          <div className="hidden md:flex items-center gap-3 text-[10px] font-mono text-muted-foreground border-t border-border pt-3 mt-auto whitespace-nowrap overflow-hidden">
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <Ruler className="w-3 h-3 text-primary" />
              <span>{player.height}</span>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <Weight className="w-3 h-3 text-primary" />
              <span>{player.weight}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
```

---

## Component: StatsChart (StatsChart.tsx)

```tsx
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { type PlayerStats } from "@shared/schema";

interface StatsChartProps {
  stats: PlayerStats[];
  dataKey: keyof PlayerStats;
  color?: string;
  label: string;
}

function generateGameData(avg: number, games: number): { game: number; value: number }[] {
  const data: { game: number; value: number }[] = [];
  const variance = avg * 0.35;
  let seed = avg * 1000;
  for (let i = 1; i <= games; i++) {
    seed = (seed * 9301 + 49297) % 233280;
    const rand = seed / 233280;
    const offset = (rand - 0.5) * 2 * variance;
    const value = Math.max(0, Math.round((avg + offset) * 10) / 10);
    data.push({ game: i, value });
  }
  return data;
}

export function StatsChart({ stats, dataKey, color = "#ff5722", label }: StatsChartProps) {
  const sortedStats = [...stats].sort((a, b) => a.season.localeCompare(b.season));
  const currentSeason = sortedStats[sortedStats.length - 1];
  if (!currentSeason) return null;

  const avg = Number(currentSeason[dataKey]);
  const gamesPlayed = currentSeason.gamesPlayed || 30;
  const gameData = generateGameData(avg, gamesPlayed);
  const seasonLabel = currentSeason.season;

  return (
    <div className="w-full h-[200px] md:h-[300px] bg-card/30 rounded-xl border border-white/5 p-2 md:p-4">
      <div className="mb-2 md:mb-4 flex items-center justify-between">
        <h4 className="text-[10px] md:text-sm font-medium text-muted-foreground uppercase tracking-widest">{label}</h4>
        <div className="flex items-center gap-1 md:gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></span>
          <span className="text-[9px] md:text-xs text-muted-foreground font-mono">{seasonLabel} &middot; Per Game</span>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height="85%">
        <AreaChart data={gameData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
          <defs>
            <linearGradient id={`color${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis 
            dataKey="game" stroke="rgba(255,255,255,0.3)" fontSize={9}
            tickLine={false} axisLine={false} tickMargin={5}
            fontFamily="var(--font-mono)" tick={{ fontSize: 9 }}
            interval="preserveStartEnd"
            label={{ value: "Game", position: "insideBottomRight", offset: -5, fontSize: 8, fill: "rgba(255,255,255,0.3)" }}
          />
          <YAxis stroke="rgba(255,255,255,0.3)" fontSize={9} tickLine={false} axisLine={false} fontFamily="var(--font-mono)" width={30} />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))',
              color: 'hsl(var(--foreground))', borderRadius: '8px',
              fontFamily: 'var(--font-mono)', fontSize: '11px'
            }}
            itemStyle={{ color: color }}
            cursor={{ stroke: 'rgba(255,255,255,0.1)' }}
            labelFormatter={(g) => `Game ${g}`}
            formatter={(value: number) => [value, label]}
          />
          <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fillOpacity={1} fill={`url(#color${dataKey})`} animationDuration={1500} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
```

---

## Page: Home (Home.tsx) — Key Sections

### Hero Section
```tsx
<section className="relative h-[80vh] flex items-center justify-center overflow-visible border-b border-border/40 z-20">
  <div className="absolute inset-0 bg-background z-0">
    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_0%,black_70%,transparent_100%)]" />
  </div>

  <div className="container relative z-10 px-4 text-center">
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-primary mb-6">
      <Activity className="w-3 h-3" />
      <span>REAL-TIME STATS</span>
    </div>
    
    <h1 className="font-display text-7xl md:text-9xl font-bold tracking-tighter text-foreground mb-6">
      <span style={{ 
        color: 'black',
        textShadow: '-2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff, 2px 2px 0 #fff, -2px 0 0 #fff, 2px 0 0 #fff, 0 -2px 0 #fff, 0 2px 0 #fff'
      }}>HOOP</span><span className="text-primary text-glow">CENTRAL</span>
    </h1>
    
    <p className="font-body text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10">
      The ultimate database for modern basketball stats. Track performance of the biggest stars and hottest prospects.
    </p>

    {/* Search bar */}
    <div className="max-w-md mx-auto relative group z-[100]">
      <form className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <Input className="pl-12 py-7 rounded-full bg-white/5 border-black text-lg focus:border-primary/50 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50 border-2" placeholder="Search players or teams..." />
        <Button type="submit" className="absolute right-2 top-2 rounded-full h-10 w-10 p-0" variant="default">
          <ArrowRight className="w-4 h-4" />
        </Button>
      </form>
    </div>
  </div>
</section>
```

### Stats Strip
```tsx
<section className="border-b border-border/40 bg-card/30 backdrop-blur-sm py-8">
  <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
    {[
      { label: "Active Players", value: "500+", icon: Users },
      { label: "Active Scouts", value: "1.2k", icon: Search },
      { label: "Seasons Tracked", value: "75", icon: Trophy },
      { label: "Teams", value: "100+", icon: Users },
    ].map((stat, i) => (
      <div key={i} className="flex items-center gap-4 justify-center group">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
          <stat.icon className="w-6 h-6" />
        </div>
        <div>
          <div className="font-display text-3xl font-bold">{stat.value}</div>
          <div className="text-xs font-mono text-muted-foreground uppercase tracking-widest">{stat.label}</div>
        </div>
      </div>
    ))}
  </div>
</section>
```

### Trending Section
```tsx
<section className="py-24 bg-background relative overflow-hidden">
  <div className="container mx-auto px-4">
    <div className="flex items-end justify-between mb-12">
      <div>
        <h2 className="text-4xl md:text-5xl text-foreground mb-2">Most <span className="text-primary text-glow">Viewed</span></h2>
        <p className="text-muted-foreground">Trending athletes this week</p>
      </div>
    </div>
    <div className="grid grid-cols-3 md:grid-cols-5 gap-2 sm:gap-6 md:gap-8">
      {/* PlayerCard components here */}
    </div>
  </div>
</section>
```

### Featured Section
```tsx
<section className="py-24 bg-muted relative overflow-hidden border-t border-border">
  <div className="container mx-auto px-4">
    <h2 className="text-4xl md:text-5xl text-foreground mb-2">Featured <span className="text-primary">Athletes</span></h2>
    <p className="text-muted-foreground">Top performers from the current season</p>
    <div className="grid grid-cols-3 md:grid-cols-5 gap-2 sm:gap-6 md:gap-8">
      {/* PlayerCard components here */}
    </div>
  </div>
</section>
```

### Favorites Bar
```tsx
<section className="py-6 bg-background border-y border-border overflow-hidden">
  <div className="container mx-auto px-4">
    <div className="flex items-center gap-6 overflow-x-auto pb-2 no-scrollbar">
      <div className="flex-shrink-0 flex items-center gap-2 pr-6 border-r border-border">
        <Trophy className="w-4 h-4 text-primary" />
        <span className="font-display text-xl font-bold uppercase tracking-tight">Favorites</span>
      </div>
      <div className="flex items-center gap-4">
        {/* Circular headshot avatars with border-2 border-border, hover:border-primary, w-12 h-12 rounded-full */}
      </div>
    </div>
  </div>
</section>
```

---

## Page: Player Directory (PlayerDirectory.tsx)

```tsx
<div className="min-h-screen pt-12 pb-24 bg-background">
  <div className="container mx-auto px-4">
    <h1 className="text-3xl md:text-7xl font-display text-foreground mb-2 md:mb-4">
      Player <span className="text-primary text-glow">Directory</span>
    </h1>
    <p className="text-muted-foreground text-sm md:text-lg max-w-xl">
      Browse the complete roster. Filter by position or search by name.
    </p>

    {/* Sticky filter bar */}
    <div className="sticky top-20 z-40 bg-background/95 backdrop-blur-xl border border-border rounded-2xl p-3 md:p-4 mb-6 md:mb-12 shadow-2xl">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search player name..." className="pl-10 bg-card/50 border-border" />
        </div>
        <Select>
          <SelectTrigger className="w-full md:w-[200px] bg-card/50 border-border">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <SelectValue placeholder="Position" />
          </SelectTrigger>
          <SelectContent>
            {["ALL", "PG", "SG", "SF", "PF", "C"].map((pos) => (
              <SelectItem key={pos} value={pos}>{pos === "ALL" ? "All Positions" : pos}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>

    {/* Results grid */}
    <div className="grid grid-cols-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 md:gap-6">
      {/* PlayerCard components */}
    </div>

    {/* Loading skeleton */}
    {/* <div className="aspect-[4/5] bg-card/50 rounded-xl animate-pulse border border-border" /> */}

    {/* Empty state */}
    {/* <div className="text-center py-24 bg-card/30 rounded-3xl border border-dashed border-border">
      <h3 className="font-display text-2xl text-muted-foreground mb-2">No players found</h3>
    </div> */}
  </div>
</div>
```

---

## Page: Player Profile (PlayerProfile.tsx) — Key Sections

### Header with Background
```tsx
<div className="relative min-h-[auto] md:min-h-[60vh] overflow-hidden border-b border-border pb-6 md:pb-12">
  <div className="absolute inset-0 bg-background/60 z-10" />
  <div className="absolute inset-0 bg-cover bg-center opacity-10 z-0 grayscale"
    style={{ backgroundImage: `url(${player.headshotUrl})` }} />
  
  <div className="container mx-auto px-4 h-full relative z-20 flex flex-col justify-between py-8">
    {/* Back button */}
    <Button variant="outline" size="sm" className="rounded-full w-fit mb-4" onClick={() => window.history.back()}>
      <ArrowLeft className="w-4 h-4 mr-2" /> Back
    </Button>

    <div className="flex flex-col md:flex-row items-center md:items-end gap-4 md:gap-12">
      {/* Player image */}
      <div className="relative flex-shrink-0 z-30">
        <div className="w-36 h-36 md:w-64 md:h-64 rounded-2xl overflow-hidden border-4 border-background shadow-2xl bg-muted">
          <img src={player.headshotUrl} className="w-full h-full object-cover object-top" />
        </div>
        {/* Jersey number overlay */}
        <div className="absolute -top-3 -right-3 md:-top-4 md:-right-4 bg-primary text-white w-12 h-12 md:w-16 md:h-16 flex items-center justify-center rounded-lg font-display text-2xl md:text-3xl font-bold border-4 border-background shadow-lg">
          #{player.jerseyNumber}
        </div>
      </div>

      {/* Player info */}
      <div className="flex-1 pb-4 md:pb-8">
        <h3 className="text-primary font-mono text-sm md:text-lg uppercase tracking-widest mb-1">{player.team}</h3>
        <h1 className="font-display text-4xl md:text-8xl font-bold leading-[0.85] text-foreground tracking-tighter">
          {player.name}
        </h1>
        
        {/* Info pills */}
        <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-foreground/60 font-mono">
          <Badge variant="outline" className="text-foreground border-border px-4 py-1">{player.position}</Badge>
          <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-full border border-border">
            <span className="text-primary font-bold">HT</span> {player.height}
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-full border border-border">
            <span className="text-primary font-bold">WT</span> {player.weight}
          </div>
        </div>

        {/* Hometown box */}
        <div className="flex items-center gap-2 px-4 py-3 bg-primary/5 rounded-xl border border-primary/20 w-fit">
          <span className="text-[10px] uppercase tracking-[0.2em] text-primary/70 font-bold">Hometown</span>
          <span className="text-lg text-foreground font-mono font-bold">{player.hometown}</span>
        </div>
      </div>
    </div>
  </div>
</div>
```

### Current Season Stats
```tsx
<section className="bg-card rounded-2xl p-6 border border-border shadow-xl">
  <h3 className="font-display text-2xl mb-4 border-b border-border pb-2">Current Season (2025-26)</h3>
  <div className="grid grid-cols-2 gap-4">
    <div className="bg-background rounded-xl p-4 border border-border text-center">
      <Target className="w-6 h-6 text-primary mx-auto mb-2 opacity-80" />
      <div className="font-display text-4xl">24.5</div>
      <div className="text-[10px] text-muted-foreground uppercase tracking-widest">PPG</div>
    </div>
    {/* Similar blocks for APG, RPG */}
  </div>
</section>
```

### Season History Table
```tsx
<section className="bg-card rounded-2xl border border-border overflow-hidden shadow-xl">
  <div className="p-6 border-b border-border">
    <h3 className="font-display text-2xl">Season History</h3>
  </div>
  <table className="w-full text-sm text-left">
    <thead className="bg-muted text-xs uppercase font-mono text-muted-foreground">
      <tr>
        <th className="px-6 py-4 font-medium">Season</th>
        <th className="px-6 py-4 font-medium">League</th>
        <th className="px-6 py-4 font-medium">Team</th>
        <th className="px-6 py-4 font-medium">GP</th>
        <th className="px-6 py-4 font-medium text-primary">PTS</th>
        <th className="px-6 py-4 font-medium">REB</th>
        <th className="px-6 py-4 font-medium text-accent">AST</th>
        <th className="px-6 py-4 font-medium">BLK</th>
        <th className="px-6 py-4 font-medium">STL</th>
        <th className="px-6 py-4 font-medium text-yellow-600">FG%</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-border">
      <tr className="hover:bg-muted/50 transition-colors">
        <td className="px-6 py-4 font-mono font-medium">2025-26</td>
        <td className="px-6 py-4 font-mono text-muted-foreground">NBA</td>
        <td className="px-6 py-4 uppercase font-mono text-primary">Team Name</td>
        <td className="px-6 py-4 text-base text-muted-foreground">45</td>
        <td className="px-6 py-4 text-base font-bold text-foreground">24.5</td>
        <td className="px-6 py-4 text-base text-muted-foreground">5.2</td>
        <td className="px-6 py-4 text-base text-muted-foreground">6.1</td>
        <td className="px-6 py-4 text-base text-muted-foreground">0.5</td>
        <td className="px-6 py-4 text-base text-muted-foreground">1.2</td>
        <td className="px-6 py-4 text-base font-mono text-accent">48.5%</td>
      </tr>
      {/* Traded player row */}
      <tr className="hover:bg-muted/50 transition-colors bg-muted/20">
        <td className="px-6 py-4 font-mono font-medium">
          2024-25
          <span className="text-[10px] font-sans bg-yellow-600/20 text-yellow-500 px-1.5 py-0.5 rounded">TRADED</span>
        </td>
      </tr>
    </tbody>
  </table>
</section>
```

### Awards Section
```tsx
<section className="bg-card rounded-2xl border border-border overflow-hidden shadow-xl">
  <div className="p-6 border-b border-border">
    <h3 className="font-display text-2xl">Awards & Achievements</h3>
  </div>
  <div className="p-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div className="flex items-center gap-4 p-4 bg-muted rounded-xl border border-border">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <Trophy className="w-5 h-5" />
        </div>
        <div>
          <div className="font-bold text-foreground">MVP</div>
          <div className="text-sm font-mono text-muted-foreground">2024, 2025</div>
        </div>
      </div>
    </div>
    {/* Empty state */}
    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-xl">
      <Trophy className="w-12 h-12 mb-4 opacity-20" />
      <p className="font-display text-xl uppercase tracking-wider">No awards recorded yet</p>
    </div>
  </div>
</section>
```

### Profile Views Counter
```tsx
<div className="flex items-center gap-3 text-muted-foreground bg-card w-fit px-6 py-3 rounded-2xl border border-border shadow-sm">
  <Eye className="w-6 h-6 text-primary" />
  <span className="font-display text-2xl uppercase tracking-wider font-bold">
    <span className="text-black dark:text-white">12,450</span>
    <span className="ml-3">Profile Views</span>
  </span>
</div>
```

---

## Page: Team Roster (TeamRoster.tsx)

```tsx
<div className="min-h-screen pt-12 pb-24 bg-background">
  <div className="container mx-auto px-4">
    {/* Back button */}
    <Link href="/players">
      <Button variant="ghost" className="mb-4 -ml-4">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Directory
      </Button>
    </Link>

    {/* Favorite team button */}
    <Button variant="default" size="sm" className="flex items-center gap-2 rounded-lg border border-primary transition-all">
      <Flag className="w-4 h-4 fill-current" />
      <span className="font-display font-bold uppercase tracking-tight">Favorited</span>
    </Button>

    {/* Team header */}
    <div className="flex items-center gap-4">
      <div className="w-16 h-16 flex items-center justify-center flex-shrink-0">
        <img src="team-logo-url" alt="Team logo" className="max-w-full max-h-full object-contain" />
      </div>
      <div>
        <h1 className="text-4xl md:text-6xl font-display text-foreground uppercase tracking-tighter">
          Team Name <span className="text-primary">Roster</span>
        </h1>
        <p className="text-muted-foreground font-mono">2025-26 Season</p>
      </div>
    </div>

    {/* Player grid sorted by jersey number */}
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
      {/* PlayerCard components */}
    </div>

    {/* Empty state */}
    <div className="text-center py-24 bg-card/30 rounded-3xl border border-dashed border-white/10">
      <h3 className="font-display text-2xl text-muted-foreground">No roster data available</h3>
    </div>
  </div>
</div>
```

---

## Admin UI Patterns

### Admin Login Button (bottom corner)
```tsx
<Button size="icon" variant="outline" className="rounded-full opacity-30 hover:opacity-100 transition-opacity">
  <Lock className="w-4 h-4" />
</Button>
```

### Admin Login Card
```tsx
<div className="bg-card border border-border rounded-md p-4 shadow-2xl w-72">
  <span className="font-display text-sm uppercase tracking-wider">Admin Login</span>
  <input type="password" placeholder="Password"
    className="w-full px-3 py-2 bg-muted border border-border rounded-md text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-primary" />
  <Button className="w-full">Login</Button>
</div>
```

### Admin Badge (when logged in)
```tsx
<Badge variant="outline" className="bg-card border-primary/30 text-primary px-3 py-1">
  <Lock className="w-3 h-3 mr-1" /> Admin
</Badge>
```

---

## Design Patterns Summary

- **Loading spinner**: `w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin`
- **Skeleton loader**: `animate-pulse bg-card/50 border border-border`
- **Empty state**: Dashed border, centered icon at 20% opacity, Teko heading
- **Card hover**: `-translate-y-1`, `border-primary/50`, `shadow-lg shadow-primary/5`
- **Badges**: Orange bg for position, outline for info
- **Favorite button**: Flag icon, fills when active, border switches to primary
- **Section headings**: Teko 4xl-5xl, second word in primary color
- **Mono labels**: JetBrains Mono, text-[10px], uppercase, tracking-widest, muted color
- **Grid layouts**: 2-3 cols mobile, 4-5 cols desktop
- **Responsive text**: text-sm mobile → text-2xl desktop pattern

---

## API Endpoints (for reference)

- `GET /api/players` — query params: `?search=`, `?position=`
- `GET /api/players/:id` — returns player + stats + awards
- `POST /api/players/:id/view` — increment view count
- `GET /api/teams/:team/roster/:season` — team roster
- `GET /api/teams/:team/record/:season` — team record
- `GET /api/teams/count` — total teams
- `GET /api/teams/all` — all teams with league info
- `GET /api/featured-players` — featured player objects
- `GET /api/featured-player-ids` — featured player ID array
- `POST /api/admin/login` — body: { password }
- `GET /api/admin/check` — header: Authorization Bearer token
- `POST /api/players/:id/headshot` — upload headshot (admin)
- `PATCH /api/players/:id` — edit player (admin)
- `POST /api/scraper/nba` — trigger scraper
- `GET /api/scraper/status` — scraper status

## Data Types

```typescript
interface Player {
  id: number;
  name: string;
  position: string;
  team: string;
  height: string;
  weight: string;
  jerseyNumber: number;
  headshotUrl: string;
  bio: string;
  profileViews: number;
  hometown: string;
  birthDate: string;
}

interface PlayerStats {
  id: number;
  playerId: number;
  season: string;
  team: string;
  league: string;
  gamesPlayed: number;
  pointsPerGame: string;
  reboundsPerGame: string;
  assistsPerGame: string;
  stealsPerGame: string;
  blocksPerGame: string;
  fieldGoalPct: string;
}
