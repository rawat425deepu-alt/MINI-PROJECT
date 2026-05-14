import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useDB, api, useAuth } from "@/lib/store";
import { PageHeader, Card, Button, Input, Label, EmptyState, Badge } from "@/components/ui/sports";
import { Plus, Trash2, Edit3, Shield } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/teams")({
  head: () => ({
    meta: [
      { title: "Teams — SportsOPS" },
      { name: "description", content: "Create and manage teams, coaches and standings." },
    ],
  }),
  component: TeamsPage,
});

function TeamsPage() {
  const db = useDB();
  const authed = useAuth();
  const [show, setShow] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [q, setQ] = useState("");

  const filtered = db.teams.filter((t) => !q || t.name.toLowerCase().includes(q.toLowerCase()) || t.city.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Teams"
        subtitle="Roster, coaching staff and competition standings."
        action={authed && <Button onClick={() => { setEditing(null); setShow(true); }}><Plus className="size-4" /> Add Team</Button>}
      />

      <Card className="p-4">
        <Input placeholder="Search teams or cities…" value={q} onChange={(e) => setQ(e.target.value)} />
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((t) => {
          const players = db.players.filter((p) => p.team === t.name);
          const points = t.wins * 3 + t.draws;
          return (
            <Card key={t.id} className="p-5 group hover:shadow-glow transition">
              <div className="flex items-start justify-between">
                <div className="size-12 rounded-lg bg-gradient-primary grid place-items-center shadow-glow">
                  <Shield className="size-6 text-primary-foreground" />
                </div>
                <Badge>{t.founded}</Badge>
              </div>
              <h3 className="mt-4 text-xl font-bold">{t.name}</h3>
              <p className="text-sm text-muted-foreground">{t.city} · Coach: {t.coach}</p>

              <div className="mt-4 grid grid-cols-4 gap-2 text-center">
                <Stat label="W" value={t.wins} tone="text-success" />
                <Stat label="D" value={t.draws} tone="text-warning" />
                <Stat label="L" value={t.losses} tone="text-destructive" />
                <Stat label="PTS" value={points} tone="text-primary" />
              </div>
              <p className="mt-4 text-xs text-muted-foreground">{players.length} player{players.length === 1 ? "" : "s"} on roster</p>

              {authed && (
                <div className="mt-4 flex gap-2">
                  <Button size="sm" variant="secondary" onClick={() => { setEditing(t.id); setShow(true); }}>
                    <Edit3 className="size-3.5" /> Edit
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => { api.deleteTeam(t.id); toast.success("Team deleted"); }}>
                    <Trash2 className="size-3.5" /> Delete
                  </Button>
                </div>
              )}
            </Card>
          );
        })}
      </div>
      {!filtered.length && <EmptyState title="No teams yet" hint="Add a team to start building your league." />}

      {show && <TeamForm editing={editing} onClose={() => setShow(false)} />}
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div className="rounded-md bg-secondary/40 py-2">
      <p className={`font-display font-bold text-lg ${tone}`}>{value}</p>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
    </div>
  );
}

function TeamForm({ editing, onClose }: { editing: string | null; onClose: () => void }) {
  const db = useDB();
  const existing = editing ? db.teams.find((t) => t.id === editing) : null;
  const [f, setF] = useState({
    name: existing?.name ?? "",
    city: existing?.city ?? "",
    coach: existing?.coach ?? "",
    founded: existing?.founded ?? new Date().getFullYear(),
    wins: existing?.wins ?? 0,
    losses: existing?.losses ?? 0,
    draws: existing?.draws ?? 0,
  });
  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!f.name.trim() || !f.city.trim()) return toast.error("Name and city are required");
    if (existing) { api.updateTeam(existing.id, f); toast.success("Team updated"); }
    else { api.addTeam(f); toast.success("Team added"); }
    onClose();
  }
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 backdrop-blur p-4" onClick={onClose}>
      <Card className="w-full max-w-lg p-6" >
        <form onClick={(e) => e.stopPropagation()} onSubmit={submit} className="space-y-4">
          <h3 className="text-xl font-bold">{existing ? "Edit Team" : "Add Team"}</h3>
          <div><Label>Name</Label><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} maxLength={60} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>City</Label><Input value={f.city} onChange={(e) => setF({ ...f, city: e.target.value })} /></div>
            <div><Label>Coach</Label><Input value={f.coach} onChange={(e) => setF({ ...f, coach: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-4 gap-3">
            <div><Label>Founded</Label><Input type="number" value={f.founded} onChange={(e) => setF({ ...f, founded: +e.target.value })} /></div>
            <div><Label>Wins</Label><Input type="number" value={f.wins} onChange={(e) => setF({ ...f, wins: +e.target.value })} /></div>
            <div><Label>Draws</Label><Input type="number" value={f.draws} onChange={(e) => setF({ ...f, draws: +e.target.value })} /></div>
            <div><Label>Losses</Label><Input type="number" value={f.losses} onChange={(e) => setF({ ...f, losses: +e.target.value })} /></div>
          </div>
          <div className="flex justify-end gap-2"><Button type="button" variant="ghost" onClick={onClose}>Cancel</Button><Button type="submit">Save</Button></div>
        </form>
      </Card>
    </div>
  );
}
