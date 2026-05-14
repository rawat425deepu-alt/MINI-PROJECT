import { createFileRoute, Link } from "@tanstack/react-router";
import { useDB } from "@/lib/store";
import { PageHeader, StatCard, Card, Badge } from "@/components/ui/sports";
import { Users, Shield, CalendarDays, Trophy, Flame, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SportsOPS — Sports Management Dashboard" },
      { name: "description", content: "Manage players, teams, matches and tournaments from one professional dashboard." },
      { property: "og:title", content: "SportsOPS — Sports Management Dashboard" },
      { property: "og:description", content: "Players, teams, fixtures, live scores and stats — all in one place." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const db = useDB();
  const live = db.matches.find((m) => m.status === "live");
  const upcoming = db.matches.filter((m) => m.status === "scheduled").slice(0, 4);
  const recent = db.matches.filter((m) => m.status === "completed").slice(-3).reverse();

  // Tick to simulate live score timer
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="space-y-8">
      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-animated border border-border p-6 sm:p-10 shadow-elevated shimmer"
      >
        <div className="absolute -top-20 -right-20 size-80 rounded-full bg-primary/20 blur-3xl pointer-events-none animate-float-slow" />
        <div className="absolute -bottom-24 -left-24 size-80 rounded-full bg-accent/20 blur-3xl pointer-events-none animate-float-slow" style={{ animationDelay: "2s" }} />
        <div className="relative max-w-2xl">
          <Badge tone="ongoing">Season 2026</Badge>
          <h1 className="mt-4 text-4xl sm:text-5xl font-bold leading-tight">
            Run your league like a <span className="text-shine">pro franchise</span>.
          </h1>
          <p className="mt-3 text-muted-foreground text-base sm:text-lg">
            Register players, build teams, schedule matches, track live scores, and crown champions — all from one beautiful command center.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/matches" className="group inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-gradient-primary text-primary-foreground font-semibold hover:shadow-glow transition-all hover:scale-105 active:scale-95">
              View Fixtures <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link to="/tournaments" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-secondary hover:bg-secondary/70 transition-all hover:scale-105 active:scale-95 font-semibold">
              Tournaments
            </Link>
          </div>
        </div>
      </motion.section>

      {/* Stats */}
      <section className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard label="Players" value={db.players.length} icon={<Users className="size-5 text-primary" />} accent="primary" delay={0.05} />
        <StatCard label="Teams" value={db.teams.length} icon={<Shield className="size-5 text-accent" />} accent="accent" delay={0.1} />
        <StatCard label="Matches" value={db.matches.length} icon={<CalendarDays className="size-5 text-success" />} accent="success" delay={0.15} />
        <StatCard label="Tournaments" value={db.tournaments.length} icon={<Trophy className="size-5 text-warning" />} accent="warning" delay={0.2} />
      </section>

      {/* Live + Upcoming */}
      <section className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Flame className="size-5 text-destructive" />
              <h2 className="text-xl font-bold">Live Scoreboard</h2>
            </div>
            {live && <Badge tone="live">● LIVE</Badge>}
          </div>
          {live ? (
            <div className="rounded-xl bg-background/60 border border-border p-6">
              <div className="text-center text-xs text-muted-foreground mb-4">{live.venue}</div>
              <div className="grid grid-cols-3 items-center gap-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">{live.teamA}</p>
                  <p className="mt-2 text-6xl font-display font-bold text-primary animate-pulse-score">{live.scoreA ?? 0}</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-display font-bold">VS</div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {Math.floor((tick % 90) + 1)}'
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">{live.teamB}</p>
                  <p className="mt-2 text-6xl font-display font-bold text-accent animate-pulse-score">{live.scoreB ?? 0}</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">No matches in progress. Check the fixtures.</p>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Upcoming</h2>
          <ul className="space-y-3">
            {upcoming.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-2 p-3 rounded-md bg-secondary/40 border border-border">
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate">{m.teamA} vs {m.teamB}</p>
                  <p className="text-xs text-muted-foreground">{new Date(m.date).toLocaleDateString()} · {m.venue}</p>
                </div>
                <Badge tone="scheduled">Sched</Badge>
              </li>
            ))}
            {!upcoming.length && <p className="text-sm text-muted-foreground">No upcoming fixtures.</p>}
          </ul>
        </Card>
      </section>

      {/* Recent results */}
      <section>
        <h2 className="text-xl font-bold mb-4">Recent Results</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {recent.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <Card className="p-5 hover-lift tilt-card">
                <p className="text-xs text-muted-foreground">{new Date(m.date).toLocaleDateString()} · {m.venue}</p>
                <div className="mt-3 grid grid-cols-3 items-center text-center">
                  <p className="text-sm font-semibold truncate">{m.teamA}</p>
                  <p className="font-display font-bold text-2xl">
                    <span className={m.scoreA! > m.scoreB! ? "text-primary" : ""}>{m.scoreA}</span>
                    <span className="mx-2 text-muted-foreground">–</span>
                    <span className={m.scoreB! > m.scoreA! ? "text-primary" : ""}>{m.scoreB}</span>
                  </p>
                  <p className="text-sm font-semibold truncate">{m.teamB}</p>
                </div>
                <div className="mt-3 flex justify-end">
                  <Badge tone="completed">Final</Badge>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
