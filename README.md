# 🎯 MINI-PROJECT — SportsOPS Management System

> **A Full-Stack Sports Management Platform** combining a modern React web interface with a pure C console backend

![HTML](https://img.shields.io/badge/HTML-E34C26?style=flat-square&logo=html5&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React%2019-61DAFB?style=flat-square&logo=react&logoColor=black)
![C](https://img.shields.io/badge/C-A8B9CC?style=flat-square&logo=c&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Project Structure](#project-structure)
- [Frontend Setup](#frontend-setup)
- [Backend Setup](#backend-setup)
- [Quick Start](#quick-start)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Data Schema](#data-schema)
- [Contributing](#contributing)

---

## 🚀 Overview

**SportsOPS** is a comprehensive sports management system demonstrating full-stack development:

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Frontend** | React 19 + TanStack Start | Modern, responsive UI with real-time updates |
| **Backend (CLI)** | Pure C with binary I/O | Academic backend proving same data model |
| **Data Layer** | localStorage (web) / Binary files (C) | Persistent storage options |
| **Styling** | Tailwind CSS v4 + Framer Motion | Beautiful, animated interface |

---

## 📁 Project Structure

```
MINI-PROJECT/
├── PROJECT/
│   └── P2/
│       ├── SPORTS/
│       │   └── sportsops-frontend/     # Main web application
│       │       ├── src/
│       │       │   ├── routes/         # File-based routing (React)
│       │       │   ├── components/     # React components
│       │       │   ├── lib/            # Store & utilities
│       │       │   └── styles.css      # Design tokens
│       │       ├── package.json
│       │       └── README.md
│       │
│       ├── froont/
│       │   └── sportsops-frontend/     # Alternative frontend copy
│       │
│       └── back/
│           └── sports-c-backend/       # C console backend
│               ├── sports.c            # ~450 LOC, single file
│               ├── Makefile
│               ├── data/               # Binary data files
│               └── README.md
│
└── README.md                           # This file
```

---

## 🎨 Frontend Setup

### Prerequisites
- **Node.js** 18+ or **Bun** 1.0+
- **npm** or **bun** package manager

### Installation & Development

<details>
<summary><b>👉 Click to expand setup instructions</b></summary>

```bash
# Navigate to frontend directory
cd PROJECT/P2/SPORTS/sportsops-frontend

# Install dependencies (choose one)
bun install      # Recommended: faster & lighter
# OR
npm install

# Start development server
bun dev          # Visit http://localhost:8080
# OR
npm run dev

# Build for production
bun run build
# OR
npm run build
```

</details>

### Demo Credentials
```
Username:  admin
Password:  admin123
```

### Frontend Architecture
- **Routes**: `/src/routes/` — File-based routing system
  - `index` — Dashboard
  - `players` — Player management & CRUD
  - `teams` — Team management & standings
  - `matches` — Match tracking & results
  - `tournaments` — Tournament organization
  - `stats` — Analytics & statistics dashboard
  - `login` — Authentication page

- **Components**: `/src/components/`
  - `AppLayout` — Main layout wrapper with navigation
  - `ui/sports.tsx` — Custom sports-themed UI components
  - Shadcn-ui primitives for consistency & accessibility

- **State Management**: `/src/lib/store.ts`
  - localStorage-backed CRUD operations
  - Mirrors C backend data schema
  - Real-time data persistence

- **Styling**: `/src/styles.css`
  - oklch color space theme (arena-inspired)
  - CSS variables & design tokens
  - Gradient animations & smooth transitions

---

## 🖥️ Backend Setup (C Console)

### Prerequisites
- **GCC** 11+ (C11 support)
- **Make** (optional but recommended)

### Installation & Build

<details>
<summary><b>👉 Click to expand C backend setup</b></summary>

```bash
# Navigate to backend directory
cd PROJECT/P2/back/sports-c-backend

# Option 1: Using Makefile (recommended)
make              # Compiles to ./sports executable
make run          # Runs the program with menu interface
make clean        # Cleans build artifacts

# Option 2: Direct compilation
gcc -std=c11 -O2 -Wall -o sports sports.c
./sports
```

</details>

### Backend Features
- ✅ **CRUD Operations**: Create, Read, Update, Delete for Players, Teams, Matches, Tournaments
- 📊 **Search & Filter**: Substring matching across entities
- 📈 **Match Results**: Automatically updates team standings and statistics
- 📥 **CSV Export**: Export player data for external analysis
- 🛡️ **Input Validation**: Bounded numeric ranges and error handling
- 📁 **Binary Storage**: O(1) record access with fixed-size structs

### Storage Format
Records stored as fixed-size structs for efficient I/O:
- **players.dat** — Player records
- **teams.dat** — Team records
- **matches.dat** — Match records
- **tournaments.dat** — Tournament records

Auto-created in `data/` directory on first run.

---

## ⚡ Quick Start

### Option 1: Web Interface (Recommended for beginners)

```bash
cd PROJECT/P2/SPORTS/sportsops-frontend
bun install && bun dev
# Open browser → http://localhost:8080
# Login: admin / admin123
```

### Option 2: C Console Backend

```bash
cd PROJECT/P2/back/sports-c-backend
make
make run
# Navigate menus to manage sports data
```

### Option 3: Run Both (Advanced)

```bash
# Terminal 1: Start web frontend
cd PROJECT/P2/SPORTS/sportsops-frontend && bun dev

# Terminal 2: Start C backend (in new terminal)
cd PROJECT/P2/back/sports-c-backend && make run

# Note: Frontend uses localStorage; backend uses binary files
# Data is NOT synced between the two (independent systems)
```

---

## ✨ Features

### 🌐 Web Application
- [x] Modern React 19 interface with TypeScript
- [x] Real-time CRUD operations on all entities
- [x] Responsive design with Tailwind CSS v4
- [x] Smooth animations with Framer Motion
- [x] Interactive charts with Recharts
- [x] LocalStorage-based persistence
- [x] Dark/light mode support (via design tokens)
- [x] Mobile-friendly responsive layout
- [x] TanStack Start meta-framework integration
- [x] File-based routing for scalability

### 💻 C Backend
- [x] Menu-driven console interface
- [x] Pure C implementation (~450 lines of code)
- [x] Binary file I/O for O(1) performance
- [x] Full CRUD with validation
- [x] Search & substring matching
- [x] CSV export capability
- [x] Modular architecture
- [x] Automatic team standings calculation

---

## 🛠 Technology Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 19 | UI framework & components |
| TanStack Start | Latest | Meta-framework for routing |
| TypeScript | Latest | Type safety & DX |
| Vite | 7 | Lightning-fast build tool |
| Tailwind CSS | v4 | Utility-first styling |
| Framer Motion | Latest | Smooth animations |
| Recharts | Latest | Data visualization & charts |

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| C | C11 standard | Core language |
| GCC | 11+ | Compiler with optimizations |
| Make | Any | Build automation |

---

## 📊 Data Schema

### Web App ↔ C Backend Mapping

```
Web (TypeScript)     ←→  C struct         ←→  File
─────────────────────────────────────────────────────
Player               ←→  Player           ←→  players.dat
Team                 ←→  Team             ←→  teams.dat
Match                ←→  Match            ←→  matches.dat
Tournament           ←→  Tournament       ←→  tournaments.dat
```

Both systems implement the same logical data model but operate independently:
- **Web**: Uses in-memory store with localStorage persistence
- **C Backend**: Uses binary file I/O for disk storage

---

## 🤝 Contributing

Contributions are welcome! Here's how:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** changes (`git commit -m 'Add amazing feature'`)
4. **Push** to branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow existing code style and conventions
- Add meaningful comments for complex logic
- Test changes thoroughly before submitting PR
- Update README if adding new features or changing setup

---

## 📄 License

This project is open source and available under the **MIT License**.

---

## 💬 Support

Have questions or found a bug? 
- 📝 [Open an issue](https://github.com/rawat425deepu-alt/MINI-PROJECT/issues)
- 💭 Check existing discussions
- 🐛 Report bugs with reproduction steps

---

## 🎓 Academic Notes

This project demonstrates:
- **Full-stack development** with multiple technology stacks
- **Binary I/O** and file persistence in C
- **Modern frontend** architecture with React 19
- **Data consistency** across different implementations
- **CRUD patterns** and best practices
- **Responsive UI** design principles
- **Type-safe** TypeScript development

Perfect for learning full-stack concepts, interview prep, or portfolio building!

---

<div align="center">

**Built with ❤️ for sports enthusiasts & developers**

[⬆ Back to top](#-mini-project--sportsops-management-system)

</div>
