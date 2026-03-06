# Frontend Design Spec — Extracted Reference

This file distills **FRONTEND_DESIGN_REFERENCE.md** for implementation. Use it to keep the UI consistent.

---

## 1. Tech stack
- React + TypeScript, Vite, Tailwind CSS (CSS variables)
- shadcn/ui (new-york), Radix, wouter, TanStack React Query v5, Recharts, lucide-react

---

## 2. Theme (index.css)

### CSS variables (:root)
- **Fonts**: `--font-display: 'Teko'`, `--font-body: 'Outfit'`, `--font-mono: 'JetBrains Mono'`
- **Colors** (raw HSL, use as `hsl(var(--name))`):
  - `--background: 0 0% 100%`, `--foreground: 224 71% 4%`
  - `--card: 0 0% 98%`, `--primary: 24 95% 53%` (basketball orange), `--primary-foreground: 0 0% 100%`
  - `--muted`, `--muted-foreground`, `--border`, `--ring`, etc.
- **Radius**: `--radius: 0.5rem`

### Base
- `body`: `bg-background text-foreground antialiased font-body`, selection `bg-primary/30`
- `h1–h6`: `font-display`, bold, tracking-wide, uppercase
- Utilities: `.text-glow` (primary glow), `.glass-card`, `.stat-value` (font-mono)
- Scrollbar: 8px, thumb `border`, hover `primary`

---

## 3. Font usage
| Use            | Font            | Notes                    |
|----------------|-----------------|--------------------------|
| Headings       | Teko (display)  | Bold, uppercase, tight   |
| Body / nav     | Outfit (body)   |                          |
| Stats, numbers | JetBrains Mono  | Labels, badges, small    |

---

## 4. Navigation
- **Desktop**: Sticky, `h-16`, `border-b border-border/40`, `bg-background/80 backdrop-blur-xl`
- **Logo**: Trophy icon in `rounded bg-primary`, then "HOOP" + "CENTRAL" (CENTRAL in `text-primary`)
- **Hero “HOOP”** (per reference): Black fill + white outline via `textShadow: '-2px -2px 0 #fff, 2px -2px 0 #fff, -2px 2px 0 #fff, 2px 2px 0 #fff, ...'`
- **Nav links**: Uppercase, small, muted → primary on active/hover
- **Search**: Icon button (link to `/players` or inline search)
- **Mobile**: Bottom nav bar, icons + labels, same active state

---

## 5. Home page

### Hero
- Min height `80vh`, centered
- Background: radial gradient `from-primary/10 via-background to-background` + subtle grid (e.g. white 2% or primary tint)
- Pill: "REAL-TIME STATS" with Activity icon, `font-mono text-primary`
- Title: "HOOP" (black + white outline) + "CENTRAL" (`text-primary text-glow`), `font-display` 7xl–9xl
- Tagline: `font-body text-xl md:text-2xl text-muted-foreground`
- Search: `rounded-full`, `border-2 border-black`, `bg-white/5`, Search icon left, submit Button right (ArrowRight), `py-7` / `pl-12`

### Stats strip
- Section: `border-b border-border/40`, `bg-card/30 backdrop-blur-sm`, `py-8`
- Grid: 2 cols mobile, 4 desktop, `gap-8`
- Each: icon in `w-12 h-12 rounded-xl bg-primary/10 text-primary`, then value (`font-display text-3xl font-bold`) + label (`text-xs font-mono text-muted-foreground uppercase tracking-widest`)

### Sections (Most Viewed, Featured, Favorites)
- Heading: First word `text-foreground`, second word `text-primary` (optional `text-glow` on “Viewed”), `font-display` 4xl–5xl
- Subtitle: `text-muted-foreground`
- Grid: 3 cols mobile, 5 desktop, `gap-2 sm:gap-6 md:gap-8`
- Favorites bar (optional): horizontal scroll, Trophy + “Favorites”, circular headshot avatars, `border-2 border-border`, `hover:border-primary`

---

## 6. Player card
- **Card**: `rounded-2xl` (or `rounded-xl`), `border-border`, hover `border-primary/50`, `-translate-y-1`, `shadow-lg shadow-primary/5`
- **Image**: `aspect-[4/5]`, gradient overlay bottom, `object-cover object-top`
- **Badges**: Jersey number top-right (large, muted); position bottom-left `Badge` with `bg-primary text-white`, `rounded-sm`, small
- **Content**: Team line `font-mono text-primary uppercase` (small); name `font-display` (first name + bold last name or single line); height/weight with Ruler/Weight icons, `font-mono text-muted-foreground`
- **CTA**: “View profile →” muted

---

## 7. Player profile
- **Header**: Full-width with optional bg image (grayscale, low opacity), `border-b border-border`
- **Back**: Outline Button, ArrowLeft, rounded-full
- **Photo**: `rounded-2xl`, `border-4 border-background`, shadow; jersey # badge overlay (primary bg)
- **Info**: Team `font-mono text-primary uppercase`; name `font-display` large; pills for position (outline), HT/WT (muted bg, primary label); hometown box `bg-primary/5 border border-primary/20`
- **Sections**: Rounded-2xl cards, border, “Current Season” stats grid, “Season History” table (font-mono, primary for PTS, etc.), “Awards” grid or empty state (dashed border, Trophy icon 20% opacity)
- **Profile views**: Eye icon + count in card

---

## 8. Player directory
- Title: “Player” + “Directory” (second word `text-primary text-glow`), `font-display`
- Sticky filter bar: `rounded-2xl`, `bg-background/95 backdrop-blur-xl`, search + position Select
- Grid: 2–4 cols by breakpoint, PlayerCard components
- Empty state: Dashed border, centered message, Teko heading

---

## 9. Team roster
- Back link to directory; optional “Favorited” button (Flag icon)
- Team logo + “Team Name” + “Roster” (second word primary), season in font-mono
- Player grid (e.g. 2–4 cols); empty state dashed

---

## 10. Admin
- Lock button: bottom corner, `opacity-30 hover:opacity-100`
- Login card: small, `bg-card border`, password input, primary Button
- When logged in: “Admin” Badge with Lock icon

---

## 11. Design patterns
- **Spinner**: `border-4 border-primary border-t-transparent rounded-full animate-spin`
- **Skeleton**: `animate-pulse bg-card/50 border border-border`
- **Empty state**: Dashed border, icon ~20% opacity, Teko heading
- **Card hover**: `-translate-y-1`, `border-primary/50`, `shadow-lg shadow-primary/5`
- **Badges**: Orange bg for position; outline for neutral info
- **Favorite**: Flag icon, fill when active, border → primary when active
- **Section titles**: Teko 4xl–5xl, second word primary
- **Mono labels**: JetBrains Mono, small, uppercase, tracking-widest, muted

---

## 12. Constants & assets
- Default headshot URL; NBA/G-League/EuroLeague team lists and logo maps (see FRONTEND_DESIGN_REFERENCE.md).
- NBA headshot: `https://cdn.nba.com/headshots/nba/latest/1040x760/{id}.png`
- NBA logos: `https://cdn.nba.com/logos/nba/{teamId}/primary/L/logo.svg`

---

## 13. API & types
- Players: `GET /api/players`, `GET /api/players/:id`; optional `?search=`, `?position=`
- Profile view: `POST /api/players/:id/view`
- Teams/rosters, featured players, admin, scraper — see full reference.
- Player: id, name, position, team, height, weight, jerseyNumber, headshotUrl, bio, profileViews, hometown?, birthDate?
- PlayerStats: season, team, league, gamesPlayed, pointsPerGame, etc.

Use **FRONTEND_DESIGN_REFERENCE.md** for full code snippets, API list, and logo URLs.
