import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { login } from "@/lib/store";
import { Card, Button, Input, Label } from "@/components/ui/sports";
import { Activity, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Admin Login — SportsOPS" },
      { name: "description", content: "Sign in to manage players, teams and tournaments." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const nav = useNavigate();
  const [u, setU] = useState("");
  const [p, setP] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (login(u, p)) {
      toast.success("Welcome back, admin");
      nav({ to: "/" });
    } else {
      toast.error("Invalid credentials");
    }
  }

  return (
    <div className="grid place-items-center py-10">
      <Card className="w-full max-w-md p-8">
        <div className="flex justify-center mb-6">
          <div className="size-14 rounded-2xl bg-gradient-primary grid place-items-center shadow-glow">
            <Activity className="size-7 text-primary-foreground" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-center">Admin Sign in</h1>
        <p className="text-center text-sm text-muted-foreground mt-1">Manage your league command center</p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          <div><Label>Username</Label><Input autoFocus value={u} onChange={(e) => setU(e.target.value)} placeholder="admin" /></div>
          <div><Label>Password</Label><Input type="password" value={p} onChange={(e) => setP(e.target.value)} placeholder="••••••••" /></div>
          <Button type="submit" className="w-full"><ShieldCheck className="size-4" /> Sign in</Button>
        </form>

        <div className="mt-6 rounded-md bg-secondary/50 border border-border p-3 text-xs text-muted-foreground">
          <p className="font-semibold text-foreground mb-1">Demo credentials</p>
          <p>Username: <span className="text-primary">admin</span> · Password: <span className="text-primary">admin123</span></p>
          <p className="mt-1.5">For real apps, enable Lovable Cloud auth + a roles table.</p>
        </div>
      </Card>
    </div>
  );
}
