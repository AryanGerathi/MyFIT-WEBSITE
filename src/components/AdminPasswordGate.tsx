import { useState } from "react";
import { Lock } from "lucide-react";

const ADMIN_PASSWORD = "ARJUNISBEST";

export function AdminPasswordGate({ children }: { children: React.ReactNode }) {
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(
    sessionStorage.getItem("admin_auth") === "true"
  );
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem("admin_auth", "true");
      setUnlocked(true);
      setError(false);
    } else {
      setError(true);
      setPassword("");
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
            className="w-full rounded-xl gradient-accent text-white py-3 font-semibold hover:opacity-90 transition"
          >
            Unlock Dashboard
          </button>
        </form>
      </div>
    </div>
  );
}