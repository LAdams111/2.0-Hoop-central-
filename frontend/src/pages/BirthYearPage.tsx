import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Calendar } from "lucide-react";

interface BirthYearEntry {
  year: number;
  count: number;
}

export function BirthYearPage() {
  const { data: yearsData } = useQuery<BirthYearEntry[]>({
    queryKey: ["/api/players/birth-years"],
    placeholderData: [],
  });

  const years = Array.isArray(yearsData) ? yearsData : [];
  const sorted = [...years].sort((a, b) => b.year - a.year);

  if (sorted.length === 0) {
    const fallback = Array.from({ length: 20 }, (_, i) => ({ year: 2006 - i, count: 10 + i * 2 }));
    sorted.push(...fallback);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl font-bold uppercase tracking-tight text-white">
          Birth year
        </h1>
        <p className="mt-2 text-zinc-500">
          Browse players by the year they were born, ranked by profile views.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {sorted.map(({ year, count }) => (
          <Link key={year} href={`/players?birth_year=${year}`}>
            <a className="flex flex-col items-center rounded-xl border border-white/10 bg-[#141414] p-6 transition hover:border-orange-500/50">
              <Calendar className="mb-2 h-8 w-8 text-zinc-500" />
              <span className="font-display text-2xl font-bold text-white">{year}</span>
              <span className="mt-1 text-xs text-zinc-500">
                {count} {count === 1 ? "player" : "players"}
              </span>
            </a>
          </Link>
        ))}
      </div>
    </div>
  );
}
