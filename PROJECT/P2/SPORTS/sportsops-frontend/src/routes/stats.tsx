import { createFileRoute } from "@tanstack/react-router";
import { useDB, api } from "@/lib/store";
import { PageHeader, Card, Button } from "@/components/ui/sports";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

export const Route = createFileRoute("/stats")({
  head: () => ({
    meta: [
      { title: "Statistics — SportsOPS" },
      { name: "description", content: "Player and team performance dashboards." },
    ],
  }),
  component: Stats,
});

const COLORS = ["oklch(0.85 0.20 130)", "oklch(0.72 0.20 50)", "oklch(0.70 0.18 220)", "oklch(0.78 0.18 320)", "oklch(0.78 0.18 150)"];

function Stats() {
  const db = useDB();

  const topScorers = db.players.slice().sort((a, b) => b.goals - a.goals).slice(0, 6).map((p) => ({ name: p.name.split(" ")[0], goals: p.goals, assists: p.assists }));
  const positionDist = ["Forward", "Midfielder", "Defender", "Goalkeeper"].map((pos) => ({
    name: pos,
    value: db.players.filter((p) => p.position === pos).length,
  }));
  const teamPoints = db.teams.map((t) => ({ name: t.name.split(" ")[0], pts: t.wins * 3 + t.draws }));

  function download(name: string, data: string, type = "text/csv") {
    const blob = new Blob([data], { type });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = name; a.click();
    toast.success(`Downloaded ${name}`);
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Statistics"
        subtitle="Performance insights across players and teams."
        action={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => download("sms-data.json", api.exportJSON(), "application/json")}>
              <Download className="size-4" /> JSON
            </Button>
            <Button variant="secondary" onClick={() => download("players.csv", api.exportCSV("players"))}>
              <Download className="size-4" /> Players CSV
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <h3 className="font-bold mb-4">Top Scorers</h3>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={topScorers}>
                <XAxis dataKey="name" stroke="oklch(0.70 0.02 250)" fontSize={12} />
                <YAxis stroke="oklch(0.70 0.02 250)" fontSize={12} />
                <Tooltip contentStyle={{ background: "oklch(0.20 0.03 250)", border: "1px solid oklch(0.30 0.03 250)", borderRadius: 8 }} />
                <Legend />
                <Bar dataKey="goals" fill="oklch(0.85 0.20 130)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="assists" fill="oklch(0.72 0.20 50)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-bold mb-4">Position Distribution</h3>
          <div className="h-72">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={positionDist} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={4}>
                  {positionDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "oklch(0.20 0.03 250)", border: "1px solid oklch(0.30 0.03 250)", borderRadius: 8 }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 lg:col-span-2">
          <h3 className="font-bold mb-4">Team Points</h3>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={teamPoints}>
                <XAxis dataKey="name" stroke="oklch(0.70 0.02 250)" fontSize={12} />
                <YAxis stroke="oklch(0.70 0.02 250)" fontSize={12} />
                <Tooltip contentStyle={{ background: "oklch(0.20 0.03 250)", border: "1px solid oklch(0.30 0.03 250)", borderRadius: 8 }} />
                <Bar dataKey="pts" fill="oklch(0.85 0.20 130)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
