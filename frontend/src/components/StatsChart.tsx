import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { PlayerStats } from "@/types/api";

interface StatsChartProps {
  stats: PlayerStats[];
}

export function StatsChart({ stats }: StatsChartProps) {
  const data = stats
    .slice()
    .sort((a, b) => String(a.season).localeCompare(String(b.season)))
    .map((s) => ({
      season: s.season,
      ppg: s.ppg ?? 0,
      rpg: s.rpg ?? 0,
      apg: s.apg ?? 0,
    }));

  if (data.length === 0) return null;

  return (
    <section>
      <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-foreground">
        Current season & trends
      </h2>
      <div className="mt-4 grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-card/30 p-4">
          <h3 className="font-display text-sm font-semibold uppercase text-muted-foreground">
            Points per game
          </h3>
          <div className="mt-2 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="ppgGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(24,95%,53%)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(24,95%,53%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="season" stroke="hsl(215.4,16.3%,46.9%)" fontSize={9} fontFamily="JetBrains Mono" />
                <YAxis stroke="hsl(215.4,16.3%,46.9%)" fontSize={9} fontFamily="JetBrains Mono" tickFormatter={(v) => String(v)} />
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(0,0%,98%)", border: "1px solid hsl(214.3,31.8%,91.4%)", borderRadius: "8px" }}
                  labelStyle={{ color: "hsl(24,95%,53%)" }}
                  formatter={(value: number | undefined) => [value != null ? value.toFixed(1) : "", "PPG"]}
                />
                <Area
                  type="monotone"
                  dataKey="ppg"
                  stroke="hsl(24,95%,53%)"
                  fill="url(#ppgGrad)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card/30 p-4">
          <h3 className="font-display text-sm font-semibold uppercase text-muted-foreground">
            Assists per game
          </h3>
          <div className="mt-2 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="apgGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(172,66%,50%)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(172,66%,50%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="season" stroke="hsl(215.4,16.3%,46.9%)" fontSize={9} fontFamily="JetBrains Mono" />
                <YAxis stroke="hsl(215.4,16.3%,46.9%)" fontSize={9} fontFamily="JetBrains Mono" />
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(0,0%,98%)", border: "1px solid hsl(214.3,31.8%,91.4%)", borderRadius: "8px" }}
                  formatter={(value: number | undefined) => [value != null ? value.toFixed(1) : "", "APG"]}
                />
                <Area
                  type="monotone"
                  dataKey="apg"
                  stroke="hsl(172,66%,50%)"
                  fill="url(#apgGrad)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}
