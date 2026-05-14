import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useDB, api, useAuth } from "@/lib/store";
import { PageHeader, Card, Button, Input, Label, Select, EmptyState, Badge } from "@/components/ui/sports";
import { Plus, Trash2, Edit3, Calendar } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/matches")({
  head: () => ({
    meta: [
      { title: "Matches & Fixtures — SportsOPS" },
      { name: "description", content: "Schedule fixtures, record results and follow live scores." },
    ],
  }),
  component: MatchesPage,
});

function MatchesPage() {
  const db = useDB();
  const authed = useAuth();
  const [show, setShow] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [tab, setTab] = useState<"all" | "scheduled" | "live" | "completed">("all");
  const [q, setQ] = useState("");

  let list = db.matches.slice().sort((a, b) => +new Date(b.date) - +new Date(a.date));
  if (tab !== "all") list = list.filter((m) => m.status === tab);
  if (q) list = list.filter((m) => (m.teamA + m.teamB + m.venue).toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Matches"
        subtitle="Fixtures, live scores and results."
        action={authed && <Button onClick={() => { setEditing(null); setShow(true); }}><Plus className="size-4" /> Schedule Match</Button>}
      />

      <Card className="p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-md bg-secondary p-1">
          {(["all", "scheduled", "live", "completed"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider ${tab === t ? "bg-gradient-primary text-primary-foreground shadow" : "text-muted-foreground"}`}
            >
              {t}
            </button>
          ))}
        </div>
        <Input placeholder="Search teams or venue…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
      </Card>

      <div className="grid gap-3">
        {list.map((m) => (
          <Card key={m.id} className="p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="size-11 rounded-lg bg-secondary grid place-items-center">
                  <Calendar className="size-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{new Date(m.date).toLocaleString()}</p>
                  <p className="font-semibold">{m.teamA} <span className="text-muted-foreground mx-1.5">vs</span> {m.teamB}</p>
                  <p className="text-xs text-muted-foreground">{m.venue}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                {m.status !== "scheduled" && (
                  <div className="font-display font-bold text-2xl">
                    {m.scoreA ?? 0} <span className="text-muted-foreground">–</span> {m.scoreB ?? 0}
                  </div>
                )}
                <Badge tone={m.status}>{m.status}</Badge>
                {authed && (
                  <div className="flex gap-1">
                    <button onClick={() => { setEditing(m.id); setShow(true); }} className="p-1.5 rounded hover:bg-secondary">
                      <Edit3 className="size-4" />
                    </button>
                    <button onClick={() => { api.deleteMatch(m.id); toast.success("Match removed"); }} className="p-1.5 rounded hover:bg-destructive/20 text-destructive">
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
        {!list.length && <EmptyState title="No matches" hint="Schedule a fixture to get started." />}
      </div>

      {show && <MatchForm editing={editing} onClose={() => setShow(false)} />}
    </div>
  );
}

function MatchForm({ editing, onClose }: { editing: string | null; onClose: () => void }) {
  const db = useDB();
  const existing = editing ? db.matches.find((m) => m.id === editing) : null;
  const [f, setF] = useState({
    date: existing?.date ?? new Date().toISOString().slice(0, 16),
    venue: existing?.venue ?? "",
    teamA: existing?.teamA ?? db.teams[0]?.name ?? "",
    teamB: existing?.teamB ?? db.teams[1]?.name ?? "",
    scoreA: existing?.scoreA ?? null,
    scoreB: existing?.scoreB ?? null,
    status: existing?.status ?? ("scheduled" as const),
    tournamentId: existing?.tournamentId ?? "",
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (f.teamA === f.teamB) return toast.error("Teams must differ");
    if (!f.venue.trim()) return toast.error("Venue is required");
    const payload = {
      ...f,
      date: new Date(f.date).toISOString(),
      scoreA: f.status === "scheduled" ? null : Number(f.scoreA ?? 0),
      scoreB: f.status === "scheduled" ? null : Number(f.scoreB ?? 0),
      tournamentId: f.tournamentId || undefined,
    };
    if (existing) { api.updateMatch(existing.id, payload); toast.success("Match updated"); }
    else { api.addMatch(payload); toast.success("Match scheduled"); }
    // Auto-update team standings on completion
    if (payload.status === "completed" && payload.scoreA !== null && payload.scoreB !== null) {
      const a = db.teams.find((t) => t.name === payload.teamA);
      const b = db.teams.find((t) => t.name === payload.teamB);
      if (a && b) {
        if (payload.scoreA > payload.scoreB) { api.updateTeam(a.id, { wins: a.wins + 1 }); api.updateTeam(b.id, { losses: b.losses + 1 }); }
        else if (payload.scoreA < payload.scoreB) { api.updateTeam(b.id, { wins: b.wins + 1 }); api.updateTeam(a.id, { losses: a.losses + 1 }); }
        else { api.updateTeam(a.id, { draws: a.draws + 1 }); api.updateTeam(b.id, { draws: b.draws + 1 }); }
      }
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 backdrop-blur p-4" onClick={onClose}>
      <Card className="w-full max-w-lg p-6">
        <form onClick={(e) => e.stopPropagation()} onSubmit={submit} className="space-y-4">
          <h3 className="text-xl font-bold">{existing ? "Edit Match" : "Schedule Match"}</h3>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Team A</Label>
              <Select value={f.teamA} onChange={(e) => setF({ ...f, teamA: e.target.value })}>
                {db.teams.map((t) => <option key={t.id}>{t.name}</option>)}
              </Select>
            </div>
            <div><Label>Team B</Label>
              <Select value={f.teamB} onChange={(e) => setF({ ...f, teamB: e.target.value })}>
                {db.teams.map((t) => <option key={t.id}>{t.name}</option>)}
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>Date & time</Label><Input type="datetime-local" value={f.date.slice(0, 16)} onChange={(e) => setF({ ...f, date: e.target.value })} /></div>
            <div><Label>Venue</Label><Input value={f.venue} onChange={(e) => setF({ ...f, venue: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><Label>Status</Label>
              <Select value={f.status} onChange={(e) => setF({ ...f, status: e.target.value as typeof f.status })}>
                <option value="scheduled">Scheduled</option>
                <option value="live">Live</option>
                <option value="completed">Completed</option>
              </Select>
            </div>
            <div><Label>Score A</Label><Input type="number" value={f.scoreA ?? ""} onChange={(e) => setF({ ...f, scoreA: e.target.value === "" ? null : +e.target.value })} disabled={f.status === "scheduled"} /></div>
            <div><Label>Score B</Label><Input type="number" value={f.scoreB ?? ""} onChange={(e) => setF({ ...f, scoreB: e.target.value === "" ? null : +e.target.value })} disabled={f.status === "scheduled"} /></div>
          </div>
          <div><Label>Tournament</Label>
            <Select value={f.tournamentId} onChange={(e) => setF({ ...f, tournamentId: e.target.value })}>
              <option value="">— None —</option>
              {db.tournaments.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </Select>
          </div>
          <div className="flex justify-end gap-2"><Button type="button" variant="ghost" onClick={onClose}>Cancel</Button><Button type="submit">Save</Button></div>
        </form>
      </Card>
    </div>
  );
}
