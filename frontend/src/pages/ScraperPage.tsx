import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { QueryError } from "@/components/QueryError";

export function ScraperPage() {
  const queryClient = useQueryClient();
  const { data: status, isLoading, isError, error, refetch } = useQuery<{ running?: boolean; message?: string }>({
    queryKey: ["/api/scraper/status"],
    refetchInterval: 5000,
  });
  const triggerMutation = useMutation({
    mutationFn: () => fetch("/api/scraper/nba", { method: "POST" }).then((r) => { if (!r.ok) throw new Error("Trigger failed"); return r; }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/scraper/status"] }),
  });
  const triggerScraper = () => triggerMutation.mutate();

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="font-display text-4xl font-bold uppercase tracking-tight text-white">
          Scraper
        </h1>
        <p className="mt-2 text-zinc-500">Trigger NBA data scraping and view status.</p>
      </div>

      <div className="rounded-xl border border-white/10 bg-[#141414] p-6">
        <h2 className="font-display text-lg font-semibold uppercase text-white">Status</h2>
        {isError ? (
          <QueryError message={error instanceof Error ? error.message : "Failed to load status."} onRetry={() => refetch()} />
        ) : isLoading ? (
          <p className="mt-2 flex items-center gap-2 text-zinc-500"><LoadingSpinner className="h-4 w-4" /> Loading...</p>
        ) : (
          <p className="mt-2 font-mono text-sm text-zinc-400">
            {status?.running ? "Running" : "Idle"} {status?.message ?? ""}
          </p>
        )}
        {triggerMutation.isError && (
          <p className="mt-2 text-sm text-red-400">{triggerMutation.error instanceof Error ? triggerMutation.error.message : "Trigger failed"}</p>
        )}
        <Button className="mt-4" onClick={triggerScraper} disabled={status?.running || triggerMutation.isPending}>
          {triggerMutation.isPending ? "Starting..." : status?.running ? "Scraping..." : "Trigger NBA scrape"}
        </Button>
      </div>
    </div>
  );
}
