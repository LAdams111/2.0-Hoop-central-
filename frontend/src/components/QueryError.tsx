import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QueryErrorProps {
  message?: string;
  onRetry?: () => void;
}

export function QueryError({ message = "Something went wrong.", onRetry }: QueryErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-red-500/20 bg-red-500/5 py-12 text-center">
      <AlertCircle className="h-12 w-12 text-red-400" />
      <p className="text-zinc-300">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
