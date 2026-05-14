import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useDB, api, useAuth } from "@/lib/store";
import { PageHeader, Card, Button, Input, Label, EmptyState, Badge } from "@/components/ui/sports";
import { Plus, Trash2, Trophy } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/tournaments")({
  head: () => ({
    meta: [
      { title: "Tournaments — SportsOPS" },
      { name: "description", content: "Tournament setup, team participation and bracket visualization." },
    ],
  }),
  component: Page,
});

function Page() {
  const db = useDB();
  const authed = useAuth();
  const [show, setShow] = useState(false);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Tournaments"
        subtitle="Cup competitions, league tables and brackets."
        action={authed && <Button onClick={() => setShow(true)}><Plus className="size-4" /> New Tournament</Button>}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {db.tournaments.map((t) => {
          const matches = db.matches.filter((m) => m.tournamentId === t.id);
          return (
            <Card key={t.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-12 rounded-lg bg-gradient-accent grid place-items-center shadow-glow">
                    <Trophy className="size-6 text-accent-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">{t.name}</h3>
                    <p className="text-xs text-muted-foreground">{t.sport} · {new Date(t.startDate).toLocaleDateString()} – {new Date(t.endDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex gap-2 items-start">
                  <Badge tone={t.status}>{t.status}</Badge>
                  {authed && (
                    <button onClick={() => { api.deleteTournament(t.id); toast.success("Tournament removed"); }} className="p-1.5 rounded hover:bg-destructive/20 text-destructive">
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Bracket / standings */}
              <div className="mt-5">
                <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Standings</h4>
                <div className="space-y-1.5">
                  {standings(t.teams, db).map((row, i) => (
                    <div key={row.team} className="flex items-center justify-between rounded bg-secondary/40 px-3 py-2 text-sm">
                      <span className="flex items-center gap-2">
                        <span className={`text-xs font-bold w-5 ${i === 0 ? "text-primary" : "text-muted-foreground"}`}>#{i + 1}</span>
                        {row.team}
                      </span>
                      <span className="flex items-center gap-3 text-xs">
                        <span className="text-muted-foreground">{row.played}P</span>
                        <span className="text-success">{row.w}W</span>
                        <span className="text-warning">{row.d}D</span>
                        <span className="text-destructive">{row.l}L</span>
                        <span className="font-bold text-primary w-8 text-right">{row.pts}</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <Bracket teams={t.teams} matches={matches} />
            </Card>
          );
        })}
      </div>
      {!db.tournaments.length && <EmptyState title="No tournaments" />}

      {show && <TournamentForm onClose={() => setShow(false)} />}
    </div>
  );
}

function standings(teams: string[], db: ReturnType<typeof useDB>) {
  return teams.map((team) => {
    const ms = db.matches.filter((m) => m.status === "completed" && (m.teamA === team || m.teamB === team));
    let w = 0, d = 0, l = 0;
    for (const m of ms) {
      const isA = m.teamA === team;
      const my = isA ? m.scoreA! : m.scoreB!;
      const opp = isA ? m.scoreB! : m.scoreA!;
      if (my > opp) w++; else if (my < opp) l++; else d++;
    }
    return { team, played: ms.length, w, d, l, pts: w * 3 + d };
  }).sort((a, b) => b.pts - a.pts);
}

function Bracket({ teams, matches }: { teams: string[]; matches: { teamA: string; teamB: string; scoreA: number | null; scoreB: number | null; status: string }[] }) {
  if (teams.length < 2) return null;
  // Simple bracket-ish view: pair up adjacent teams
  const pairs = [];
  for (let i = 0; i < teams.length; i += 2) pairs.push([teams[i], teams[i + 1]].filter(Boolean));
  return (
    <div className="mt-5">
      <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Bracket</h4>
      <div className="grid grid-cols-2 gap-3">
        {pairs.map((p, i) => {
          const m = matches.find((x) => (x.teamA === p[0] && x.teamB === p[1]) || (x.teamA === p[1] && x.teamB === p[0]));
          return (
            <div key={i} className="rounded-lg border border-border bg-background/50 p-3 text-sm">
              <BracketRow team={p[0]} score={m ? (m.teamA === p[0] ? m.scoreA : m.scoreB) : null} winner={m?.status === "completed" && (m.teamA === p[0] ? m.scoreA! > m.scoreB! : m.scoreB! > m.scoreA!)} />
              <div className="my-1 border-t border-border" />
              <BracketRow team={p[1] ?? "TBD"} score={m && p[1] ? (m.teamA === p[1] ? m.scoreA : m.scoreB) : null} winner={!!(m?.status === "completed" && p[1] && (m.teamA === p[1] ? m.scoreA! > m.scoreB! : m.scoreB! > m.scoreA!))} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
function BracketRow({ team, score, winner }: { team: string; score: number | null | undefined; winner: boolean }) {
  return (
    <div className={`flex items-center justify-between ${winner ? "text-primary font-semibold" : ""}`}>
      <span className="truncate">{team}</span>
      <span className="font-display font-bold">{score ?? "–"}</span>
    </div>
  );
}

function TournamentForm({ onClose }: { onClose: () => void }) {
  const db = useDB();
  const [f, setF] = useState({
    name: "", sport: "Football",
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10),
    teams: [] as string[],
    status: "upcoming" as const,
  });
  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!f.name.trim()) return toast.error("Name is required");
    if (f.teams.length < 2) return toast.error("Pick at least 2 teams");
    api.addTournament({
      ...f,
      startDate: new Date(f.startDate).toISOString(),
      endDate: new Date(f.endDate).toISOString(),
    });
    toast.success("Tournament created");
    onClose();
  }
  function toggle(name: string) {
    setF((p) => ({ ...p, teams: p.teams.includes(name) ? p.teams.filter((x) => x !== name) : [...p.teams, name] }));
  }
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 backdrop-blur p-4" onClick={onClose}>
      <Card className="w-full max-w-lg p-6">
        <form onClick={(e) => e.stopPropagation()} onSubmit={submit} className="space-y-4">
          <h3 className="text-xl font-bold">New Tournament</h3>
          <div><Label>Name</Label><Input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
          <div className="grid grid-cols-3 gap-3">
            <div><Label>Sport</Label><Input value={f.sport} onChange={(e) => setF({ ...f, sport: e.target.value })} /></div>
            <div><Label>Start</Label><Input type="date" value={f.startDate} onChange={(e) => setF({ ...f, startDate: e.target.value })} /></div>
            <div><Label>End</Label><Input type="date" value={f.endDate} onChange={(e) => setF({ ...f, endDate: e.target.value })} /></div>
          </div>
          <div>
            <Label>Teams</Label>
            <div className="flex flex-wrap gap-2">
              {db.teams.map((t) => (
                <button type="button" key={t.id} onClick={() => toggle(t.name)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${f.teams.includes(t.name) ? "bg-gradient-primary text-primary-foreground border-transparent" : "border-border bg-secondary/40 text-muted-foreground"}`}>
                  {t.name}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2"><Button type="button" variant="ghost" onClick={onClose}>Cancel</Button><Button type="submit">Create</Button></div>
        </form>
      </Card>
    </div>
  );
}
