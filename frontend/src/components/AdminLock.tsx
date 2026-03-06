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
        className="fixed bottom-4 right-4 z-40 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-[#141414] text-zinc-500 transition hover:bg-white/5 hover:text-orange-500"
        aria-label="Admin login"
      >
        <Lock className="h-4 w-4" />
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-sm rounded-xl border border-white/10 bg-[#141414] p-6">
            <h3 className="font-display text-lg font-semibold uppercase text-white">Admin login</h3>
            <form onSubmit={handleLogin} className="mt-4 space-y-4">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:border-orange-500 focus:outline-none"
                autoFocus
              />
              {error && <p className="text-sm text-red-400">{error}</p>}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setError(""); setPassword(""); }}
                  className="rounded-lg border border-white/10 px-4 py-2 text-sm text-zinc-400 hover:bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"
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
