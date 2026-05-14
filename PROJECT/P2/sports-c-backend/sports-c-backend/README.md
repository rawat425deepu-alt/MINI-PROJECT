# SportsOPS — C Backend (Console Edition)

A standalone, menu-driven Sports Management System written in pure C using
fixed-width binary file storage. This is the academic/CLI counterpart to the
SportsOPS web application.

## Features
- Player / Team / Match / Tournament CRUD
- Substring search and listings
- Match-result entry that automatically updates team standings
- CSV export for players
- Input validation with bounded numeric ranges
- Menu-driven, modular architecture

## Folder structure
```
sports-c-backend/
├── sports.c        # Single translation unit, ~450 LOC
├── Makefile
├── README.md
└── data/           # Auto-created on first run
    ├── players.dat
    ├── teams.dat
    ├── matches.dat
    └── tournaments.dat
```

## Build & run
```bash
gcc -std=c11 -O2 -Wall -o sports sports.c
./sports
```
or with the Makefile:
```bash
make
make run
make clean
```

## Storage format
Records are written as fixed-size structs via `fwrite/fread` for O(1) iteration
and easy in-place updates with `fseek`. Deletion uses the read–rewrite pattern.

## Default data
On first launch the `data/` directory is empty. Populate it through the menus
or load the sample-data CSVs from the web app's "Export" page.

## Mapping to the web app
| Web (TypeScript)            | C struct      | File             |
|-----------------------------|---------------|------------------|
| `Player`                    | `Player`      | players.dat      |
| `Team`                      | `Team`        | teams.dat        |
| `Match`                     | `Match`       | matches.dat      |
| `Tournament`                | `Tournament`  | tournaments.dat  |

The two systems are independent at runtime. The C version proves the same
data model in a low-level language; the web version offers the rich UI.
