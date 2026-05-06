import { useState, useEffect } from "react";
import { Lock, Loader2 } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "https://myfit-backend-lxj3.onrender.com";

export function AdminPasswordGate({ children }: { children: React.ReactNode }) {
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [error,    setError]    = useState(false);
  const [loading,  setLoading]  = useState(false);

  // On mount — check if we already have a valid admin token
  useEffect(() => {
    const token = sessionStorage.getItem("admin_token");
    if (token) {
      localStorage.setItem("myfit_token", token);
      setUnlocked(true);
    }
  }, []);

  // Listen for logout event from the sidebar
  useEffect(() => {
    const handleAdminLogout = () => {
      sessionStorage.removeItem("admin_token");
      localStorage.removeItem("myfit_token");
      setUnlocked(false);
      setPassword("");
      setError(false);
    };
    window.addEventListener("admin_logout", handleAdminLogout);
    return () => window.removeEventListener("admin_logout", handleAdminLogout);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(`${API_URL}/api/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();

      if (!res.ok || !data.token) throw new Error();

      // Store token so apiFetch in backendService picks it up automatically
      sessionStorage.setItem("admin_token", data.token);
      localStorage.setItem("myfit_token", data.token);
      setUnlocked(true);
    } catch {
      setError(true);
      setPassword("");
    } finally {
      setLoading(false);
    }
  };

  if (unlocked) return <>{children}</>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/20">
      <div className="w-full max-w-sm rounded-2xl border border-border/60 bg-background p-8 shadow-lg">
        <div className="flex flex-col items-center mb-8">
          <div className="grid h-14 w-14 place-items-center rounded-2xl gradient-accent text-white mb-4">
            <Lock size={24} />
          </div>
          <h1 className="font-display font-bold text-2xl">Admin Access</h1>
          <p className="text-sm text-muted-foreground mt-1">Enter password to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(false); }}
              placeholder="Enter admin password"
              autoFocus
              className="w-full rounded-xl border border-border bg-secondary/30 px-4 py-3 text-sm outline-none focus:border-accent transition placeholder:text-muted-foreground"
            />
            {error && (
              <p className="text-xs text-red-500 mt-2">Incorrect password. Try again.</p>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl gradient-accent text-white py-3 font-semibold hover:opacity-90 transition disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading
              ? <><Loader2 size={16} className="animate-spin" /> Unlocking…</>
              : "Unlock Dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
}