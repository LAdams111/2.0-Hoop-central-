import { useState } from "react";
import { Lock } from "lucide-react";

export function AdminLock() {
  const [showModal, setShowModal] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.message || "Login failed");
        return;
      }
      setShowModal(false);
      setPassword("");
    } catch {
      setError("Network error");
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="fixed bottom-4 right-4 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card/70 text-muted-foreground opacity-70 backdrop-blur transition hover:opacity-100 hover:text-primary"
        aria-label="Admin login"
      >
        <Lock className="h-4 w-4" />
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-lg">
            <h3 className="font-display text-lg font-semibold uppercase text-foreground">Admin login</h3>
            <form onSubmit={handleLogin} className="mt-4 space-y-4">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                autoFocus
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setError(""); setPassword(""); }}
                  className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
                >
                  Log in
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
