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
      <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-white">
        Current season & trends
      </h2>
      <div className="mt-4 grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-[#141414] p-4">
          <h3 className="font-display text-sm font-semibold uppercase text-zinc-400">
            Points per game
          </h3>
          <div className="mt-2 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="ppgGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f97316" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="season" stroke="#71717a" fontSize={11} />
                <YAxis stroke="#71717a" fontSize={11} tickFormatter={(v) => String(v)} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#141414", border: "1px solid rgba(255,255,255,0.1)" }}
                  labelStyle={{ color: "#f97316" }}
                  formatter={(value: number | undefined) => [value != null ? value.toFixed(1) : "", "PPG"]}
                />
                <Area
                  type="monotone"
                  dataKey="ppg"
                  stroke="#f97316"
                  fill="url(#ppgGrad)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-[#141414] p-4">
          <h3 className="font-display text-sm font-semibold uppercase text-zinc-400">
            Assists per game
          </h3>
          <div className="mt-2 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="apgGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="season" stroke="#71717a" fontSize={11} />
                <YAxis stroke="#71717a" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#141414", border: "1px solid rgba(255,255,255,0.1)" }}
                  formatter={(value: number | undefined) => [value != null ? value.toFixed(1) : "", "APG"]}
                />
                <Area
                  type="monotone"
                  dataKey="apg"
                  stroke="#22d3ee"
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
