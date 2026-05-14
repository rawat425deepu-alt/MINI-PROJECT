// Local data store backed by localStorage. Mirrors the C backend file storage.
import { useEffect, useState } from "react";

export type Player = {
  id: string;
  name: string;
  age: number;
  position: string;
  team: string;
  matches: number;
  goals: number;
  assists: number;
};

export type Team = {
  id: string;
  name: string;
  city: string;
  coach: string;
  founded: number;
  wins: number;
  losses: number;
  draws: number;
};

export type Match = {
  id: string;
  date: string; // ISO
  venue: string;
  teamA: string;
  teamB: string;
  scoreA: number | null;
  scoreB: number | null;
  status: "scheduled" | "live" | "completed";
  tournamentId?: string;
};

export type Tournament = {
  id: string;
  name: string;
  sport: string;
  startDate: string;
  endDate: string;
  teams: string[];
  status: "upcoming" | "ongoing" | "completed";
};

type DB = {
  players: Player[];
  teams: Team[];
  matches: Match[];
  tournaments: Tournament[];
};

const KEY = "sms_db_v1";

const seed: DB = {
  teams: [
    { id: "t1", name: "Phoenix FC", city: "Mumbai", coach: "R. Sharma", founded: 2008, wins: 14, losses: 4, draws: 3 },
    { id: "t2", name: "Titan United", city: "Delhi", coach: "A. Kapoor", founded: 2005, wins: 11, losses: 6, draws: 4 },
    { id: "t3", name: "Riverside Royals", city: "Kolkata", coach: "S. Banerjee", founded: 2010, wins: 9, losses: 7, draws: 5 },
    { id: "t4", name: "Coastal Strikers", city: "Chennai", coach: "M. Iyer", founded: 2012, wins: 13, losses: 5, draws: 3 },
  ],
  players: [
    { id: "p1", name: "Arjun Verma", age: 24, position: "Forward", team: "Phoenix FC", matches: 21, goals: 18, assists: 7 },
    { id: "p2", name: "Rahul Singh", age: 27, position: "Midfielder", team: "Phoenix FC", matches: 21, goals: 5, assists: 14 },
    { id: "p3", name: "Vikram Joshi", age: 29, position: "Defender", team: "Titan United", matches: 20, goals: 1, assists: 2 },
    { id: "p4", name: "Karan Mehta", age: 23, position: "Forward", team: "Titan United", matches: 19, goals: 12, assists: 6 },
    { id: "p5", name: "Suresh Das", age: 26, position: "Goalkeeper", team: "Riverside Royals", matches: 21, goals: 0, assists: 1 },
    { id: "p6", name: "Aditya Rao", age: 25, position: "Midfielder", team: "Coastal Strikers", matches: 21, goals: 9, assists: 11 },
    { id: "p7", name: "Nikhil Patel", age: 22, position: "Forward", team: "Coastal Strikers", matches: 20, goals: 15, assists: 4 },
    { id: "p8", name: "Rohit Nair", age: 28, position: "Defender", team: "Riverside Royals", matches: 21, goals: 2, assists: 3 },
  ],
  matches: [
    { id: "m1", date: new Date(Date.now() - 7 * 864e5).toISOString(), venue: "Wankhede Arena", teamA: "Phoenix FC", teamB: "Titan United", scoreA: 3, scoreB: 2, status: "completed", tournamentId: "tn1" },
    { id: "m2", date: new Date(Date.now() - 3 * 864e5).toISOString(), venue: "Salt Lake Stadium", teamA: "Riverside Royals", teamB: "Coastal Strikers", scoreA: 1, scoreB: 1, status: "completed", tournamentId: "tn1" },
    { id: "m3", date: new Date(Date.now() + 2 * 36e5).toISOString(), venue: "Central Arena", teamA: "Phoenix FC", teamB: "Coastal Strikers", scoreA: 2, scoreB: 1, status: "live", tournamentId: "tn1" },
    { id: "m4", date: new Date(Date.now() + 2 * 864e5).toISOString(), venue: "JLN Stadium", teamA: "Titan United", teamB: "Riverside Royals", scoreA: null, scoreB: null, status: "scheduled", tournamentId: "tn1" },
    { id: "m5", date: new Date(Date.now() + 5 * 864e5).toISOString(), venue: "Marina Ground", teamA: "Coastal Strikers", teamB: "Titan United", scoreA: null, scoreB: null, status: "scheduled", tournamentId: "tn1" },
    { id: "m6", date: new Date(Date.now() + 9 * 864e5).toISOString(), venue: "Wankhede Arena", teamA: "Phoenix FC", teamB: "Riverside Royals", scoreA: null, scoreB: null, status: "scheduled", tournamentId: "tn1" },
  ],
  tournaments: [
    { id: "tn1", name: "Premier Cup 2026", sport: "Football", startDate: new Date(Date.now() - 14 * 864e5).toISOString(), endDate: new Date(Date.now() + 21 * 864e5).toISOString(), teams: ["Phoenix FC", "Titan United", "Riverside Royals", "Coastal Strikers"], status: "ongoing" },
    { id: "tn2", name: "City Champions League", sport: "Football", startDate: new Date(Date.now() + 30 * 864e5).toISOString(), endDate: new Date(Date.now() + 70 * 864e5).toISOString(), teams: ["Phoenix FC", "Coastal Strikers"], status: "upcoming" },
  ],
};

function load(): DB {
  if (typeof window === "undefined") return seed;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      localStorage.setItem(KEY, JSON.stringify(seed));
      return seed;
    }
    return JSON.parse(raw);
  } catch {
    return seed;
  }
}

function save(db: DB) {
  if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(db));
  window.dispatchEvent(new CustomEvent("sms-db-update"));
}

export function useDB() {
  const [db, setDB] = useState<DB>(() => load());
  useEffect(() => {
    const handler = () => setDB(load());
    window.addEventListener("sms-db-update", handler);
    window.addEventListener("storage", handler);
    return () => {
      window.removeEventListener("sms-db-update", handler);
      window.removeEventListener("storage", handler);
    };
  }, []);
  return db;
}

const uid = () => Math.random().toString(36).slice(2, 10);

export const api = {
  // Players
  addPlayer(p: Omit<Player, "id" | "matches" | "goals" | "assists"> & Partial<Player>) {
    const db = load();
    db.players.push({ id: uid(), matches: 0, goals: 0, assists: 0, ...p } as Player);
    save(db);
  },
  updatePlayer(id: string, patch: Partial<Player>) {
    const db = load();
    db.players = db.players.map((p) => (p.id === id ? { ...p, ...patch } : p));
    save(db);
  },
  deletePlayer(id: string) {
    const db = load();
    db.players = db.players.filter((p) => p.id !== id);
    save(db);
  },
  // Teams
  addTeam(t: Omit<Team, "id" | "wins" | "losses" | "draws"> & Partial<Team>) {
    const db = load();
    db.teams.push({ id: uid(), wins: 0, losses: 0, draws: 0, ...t } as Team);
    save(db);
  },
  updateTeam(id: string, patch: Partial<Team>) {
    const db = load();
    db.teams = db.teams.map((t) => (t.id === id ? { ...t, ...patch } : t));
    save(db);
  },
  deleteTeam(id: string) {
    const db = load();
    db.teams = db.teams.filter((t) => t.id !== id);
    save(db);
  },
  // Matches
  addMatch(m: Omit<Match, "id">) {
    const db = load();
    db.matches.push({ id: uid(), ...m });
    save(db);
  },
  updateMatch(id: string, patch: Partial<Match>) {
    const db = load();
    db.matches = db.matches.map((m) => (m.id === id ? { ...m, ...patch } : m));
    save(db);
  },
  deleteMatch(id: string) {
    const db = load();
    db.matches = db.matches.filter((m) => m.id !== id);
    save(db);
  },
  // Tournaments
  addTournament(t: Omit<Tournament, "id">) {
    const db = load();
    db.tournaments.push({ id: uid(), ...t });
    save(db);
  },
  updateTournament(id: string, patch: Partial<Tournament>) {
    const db = load();
    db.tournaments = db.tournaments.map((t) => (t.id === id ? { ...t, ...patch } : t));
    save(db);
  },
  deleteTournament(id: string) {
    const db = load();
    db.tournaments = db.tournaments.filter((t) => t.id !== id);
    save(db);
  },
  exportJSON() {
    return JSON.stringify(load(), null, 2);
  },
  exportCSV(kind: "players" | "teams" | "matches" | "tournaments") {
    const db = load();
    const rows = db[kind] as Record<string, unknown>[];
    if (!rows.length) return "";
    const headers = Object.keys(rows[0]);
    const csv = [headers.join(",")].concat(
      rows.map((r) => headers.map((h) => JSON.stringify(r[h] ?? "")).join(","))
    );
    return csv.join("\n");
  },
};

// Auth (admin login) — demo-only client-side session.
// NOTE: For production use, replace with Lovable Cloud auth + roles table.
const AUTH_KEY = "sms_auth_v1";
export function login(username: string, password: string) {
  if (username === "admin" && password === "admin123") {
    localStorage.setItem(AUTH_KEY, "1");
    window.dispatchEvent(new CustomEvent("sms-auth-update"));
    return true;
  }
  return false;
}
export function logout() {
  localStorage.removeItem(AUTH_KEY);
  window.dispatchEvent(new CustomEvent("sms-auth-update"));
}
export function useAuth() {
  const [authed, setAuthed] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem(AUTH_KEY) === "1" : false
  );
  useEffect(() => {
    const h = () => setAuthed(localStorage.getItem(AUTH_KEY) === "1");
    window.addEventListener("sms-auth-update", h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener("sms-auth-update", h);
      window.removeEventListener("storage", h);
    };
  }, []);
  return authed;
}
