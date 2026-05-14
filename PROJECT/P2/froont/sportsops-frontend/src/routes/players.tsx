import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useDB, api, useAuth } from "@/lib/store";
import { PageHeader, Card, Button, Input, Label, Select, EmptyState, Badge } from "@/components/ui/sports";
import { Plus, Search, Trash2, Edit3, Download } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/players")({
  head: () => ({
    meta: [
      { title: "Players — SportsOPS" },
      { name: "description", content: "Register, search and manage player profiles and performance." },
    ],
  }),
  component: PlayersPage,
});

const POSITIONS = ["Forward", "Midfielder", "Defender", "Goalkeeper"];

function PlayersPage() {
  const db = useDB();
  const authed = useAuth();
  const [q, setQ] = useState("");
  const [pos, setPos] = useState("");
  const [team, setTeam] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);

  const filtered = db.players.filter((p) =>
    (!q || p.name.toLowerCase().includes(q.toLowerCase())) &&
    (!pos || p.position === pos) &&
    (!team || p.team === team)
  );

  function exportCSV() {
    const csv = api.exportCSV("players");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "players.csv"; a.click();
    URL.revokeObjectURL(url);
    toast.success("Players exported");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Players"
        subtitle="Player registration, performance and roster management."
        action={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={exportCSV}><Download className="size-4" /> Export</Button>
            {authed && (
              <Button onClick={() => { setEditing(null); setShowForm(true); }}>
                <Plus className="size-4" /> Add Player
              </Button>
            )}
          </div>
        }
      />

      {/* Filters */}
      <Card className="p-4 grid gap-3 md:grid-cols-4">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input placeholder="Search by name…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
        </div>
        <Select value={pos} onChange={(e) => setPos(e.target.value)}>
          <option value="">All positions</option>
          {POSITIONS.map((p) => <option key={p}>{p}</option>)}
        </Select>
        <Select value={team} onChange={(e) => setTeam(e.target.value)}>
          <option value="">All teams</option>
          {db.teams.map((t) => <option key={t.id}>{t.name}</option>)}
        </Select>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/40 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="text-left p-3">Name</th>
                <th className="text-left p-3">Position</th>
                <th className="text-left p-3">Team</th>
                <th className="text-right p-3">Age</th>
                <th className="text-right p-3">M</th>
                <th className="text-right p-3">G</th>
                <th className="text-right p-3">A</th>
                {authed && <th className="text-right p-3">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-t border-border hover:bg-secondary/30">
                  <td className="p-3 font-medium">{p.name}</td>
                  <td className="p-3"><Badge>{p.position}</Badge></td>
                  <td className="p-3 text-muted-foreground">{p.team}</td>
                  <td className="p-3 text-right">{p.age}</td>
                  <td className="p-3 text-right">{p.matches}</td>
                  <td className="p-3 text-right text-primary font-semibold">{p.goals}</td>
                  <td className="p-3 text-right text-accent font-semibold">{p.assists}</td>
                  {authed && (
                    <td className="p-3 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => { setEditing(p.id); setShowForm(true); }} className="p-1.5 rounded hover:bg-secondary">
                          <Edit3 className="size-4" />
                        </button>
                        <button
                          onClick={() => { api.deletePlayer(p.id); toast.success("Player removed"); }}
                          className="p-1.5 rounded hover:bg-destructive/20 text-destructive"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered.length && <EmptyState title="No players found" hint="Try adjusting filters or add a new player." />}
        </div>
      </Card>

      {showForm && (
        <PlayerForm
          editing={editing}
          teams={db.teams.map((t) => t.name)}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}

function PlayerForm({ editing, teams, onClose }: { editing: string | null; teams: string[]; onClose: () => void }) {
  const db = useDB();
  const existing = editing ? db.players.find((p) => p.id === editing) : null;
  const [form, setForm] = useState({
    name: existing?.name ?? "",
    age: existing?.age ?? 22,
    position: existing?.position ?? POSITIONS[0],
    team: existing?.team ?? teams[0] ?? "",
    matches: existing?.matches ?? 0,
    goals: existing?.goals ?? 0,
    assists: existing?.assists ?? 0,
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return toast.error("Name is required");
    if (form.age < 12 || form.age > 60) return toast.error("Age must be 12–60");
    if (existing) { api.updatePlayer(existing.id, form); toast.success("Player updated"); }
    else { api.addPlayer(form); toast.success("Player added"); }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 backdrop-blur p-4" onClick={onClose}>
      <Card className="w-full max-w-lg p-6" >
        <form onClick={(e) => e.stopPropagation()} onSubmit={submit} className="space-y-4">
          <h3 className="text-xl font-bold">{existing ? "Edit Player" : "Add Player"}</h3>
          <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={60} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Age</Label><Input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: +e.target.value })} /></div>
            <div><Label>Position</Label>
              <Select value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })}>
                {POSITIONS.map((p) => <option key={p}>{p}</option>)}
              </Select>
            </div>
          </div>
          <div><Label>Team</Label>
            <Select value={form.team} onChange={(e) => setForm({ ...form, team: e.target.value })}>
              {teams.map((t) => <option key={t}>{t}</option>)}
            </Select>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><Label>Matches</Label><Input type="number" value={form.matches} onChange={(e) => setForm({ ...form, matches: +e.target.value })} /></div>
            <div><Label>Goals</Label><Input type="number" value={form.goals} onChange={(e) => setForm({ ...form, goals: +e.target.value })} /></div>
            <div><Label>Assists</Label><Input type="number" value={form.assists} onChange={(e) => setForm({ ...form, assists: +e.target.value })} /></div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit">{existing ? "Save" : "Add"}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
