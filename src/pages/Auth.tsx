import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dumbbell } from "lucide-react";
import { toast } from "sonner";

type Mode = "login" | "signup";

export default function Auth({ mode }: { mode: Mode }) {
  const [params] = useSearchParams();
  const initialRole = params.get("role") === "creator" ? "creator" : "user";
  const navigate = useNavigate();

  const submit = (role: "user" | "creator") => (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(mode === "login" ? "Welcome back!" : "Account created!");
    navigate(role === "creator" ? "/creator-dashboard" : "/dashboard");
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] grid lg:grid-cols-2">
      <div className="hidden lg:flex relative gradient-hero p-12 text-white items-end">
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: "radial-gradient(circle at 30% 30%, hsl(222 89% 55% / 0.6), transparent 50%)"
        }} />
        <div className="relative">
          <Link to="/" className="inline-flex items-center gap-2">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent shadow-glow"><Dumbbell size={18} /></span>
            <span className="font-display font-bold text-2xl">My<span className="text-accent">Fit</span></span>
          </Link>
          <h2 className="font-display font-bold text-4xl mt-12 leading-tight">Your transformation<br/>starts here.</h2>
          <p className="text-white/70 mt-3 max-w-md">Join thousands of users training with India's best fitness creators.</p>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12">
        <Card className="w-full max-w-md p-8 border-border/60 shadow-card">
          <h1 className="font-display font-bold text-2xl">{mode === "login" ? "Welcome back" : "Create your account"}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {mode === "login" ? "Sign in to continue" : "Choose how you want to use MyFit"}
          </p>

          <Tabs defaultValue={initialRole} className="mt-6">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="user">As a User</TabsTrigger>
              <TabsTrigger value="creator">As a Creator</TabsTrigger>
            </TabsList>

            {(["user", "creator"] as const).map((role) => (
              <TabsContent key={role} value={role}>
                <form onSubmit={submit(role)} className="space-y-4 mt-4">
                  {mode === "signup" && (
                    <div>
                      <Label htmlFor={`name-${role}`}>Full name</Label>
                      <Input id={`name-${role}`} required placeholder="Your name" className="mt-1.5" />
                    </div>
                  )}
                  <div>
                    <Label htmlFor={`email-${role}`}>Email</Label>
                    <Input id={`email-${role}`} type="email" required placeholder="you@example.com" className="mt-1.5" />
                  </div>
                  <div>
                    <Label htmlFor={`pwd-${role}`}>Password</Label>
                    <Input id={`pwd-${role}`} type="password" required placeholder="••••••••" className="mt-1.5" />
                  </div>
                  <Button type="submit" size="lg" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                    {mode === "login" ? "Login" : "Create account"} as {role === "creator" ? "Creator" : "User"}
                  </Button>
                </form>
              </TabsContent>
            ))}
          </Tabs>

          <p className="text-sm text-center text-muted-foreground mt-6">
            {mode === "login" ? (
              <>Don't have an account? <Link to="/signup" className="text-accent font-medium hover:underline">Sign up</Link></>
            ) : (
              <>Already have an account? <Link to="/login" className="text-accent font-medium hover:underline">Login</Link></>
            )}
          </p>
        </Card>
      </div>
    </div>
  );
}
