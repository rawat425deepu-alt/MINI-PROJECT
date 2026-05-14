# SportsOPS — Frontend

Modern Sports Management System UI built with React 19, TanStack Start, Vite 7, Tailwind v4, framer-motion, recharts.

## Setup
```bash
bun install      # or: npm install
bun dev          # http://localhost:8080
bun run build
```

## Demo login
- Username: `admin`
- Password: `admin123`

## Structure
- `src/routes/` — file-based routes (index, players, teams, matches, tournaments, stats, login)
- `src/components/` — AppLayout + reusable UI (`ui/sports.tsx`, shadcn primitives)
- `src/lib/store.ts` — localStorage-backed CRUD store (mirrors C backend schema)
- `src/styles.css` — design tokens, gradients, animations (oklch arena theme)

## Backend
This frontend uses a localStorage store for the demo. A separate standalone
**C backend** (menu-driven CLI with binary file I/O) is shipped in
`sports-c-backend.zip` and demonstrates the same data model in pure C.
