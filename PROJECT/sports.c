#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>
#include <time.h>
#include <sys/stat.h>
#define MAX_NAME      60
#define MAX_POS       16
#define MAX_CITY      40
#define MAX_VENUE     60
#define MAX_SPORT     20
#define DATA_DIR      "data"
#define PLAYERS_FILE  "data/players.dat"
#define TEAMS_FILE    "data/teams.dat"
#define MATCHES_FILE  "data/matches.dat"
#define TOURNS_FILE   "data/tournaments.dat"
typedef struct {
    int  id;
    char name[MAX_NAME];
    int  age;
    char position[MAX_POS];
    char team[MAX_NAME];
    int  matches;
    int  goals;
    int  assists;
} Player;

typedef struct {
    int  id;
    char name[MAX_NAME];
    char city[MAX_CITY];
    char coach[MAX_NAME];
    int  founded;
    int  wins;
    int  losses;
    int  draws;
} Team;
typedef struct {
    int  id;
    char date[20];          
    char venue[MAX_VENUE];
    char teamA[MAX_NAME];
    char teamB[MAX_NAME];
    int  scoreA;
    int  scoreB;
    int  status;            
    int  tournamentId;      
} Match;

typedef struct {
    int  id;
    char name[MAX_NAME];
    char sport[MAX_SPORT];
    char startDate[12];
    char endDate[12];
    int  status;            
} Tournament;
static void ensureDir(void) {
    struct stat st;
    if (stat(DATA_DIR, &st) != 0) {
#ifdef _WIN32
        system("mkdir " DATA_DIR);
#else
        mkdir(DATA_DIR, 0755);
#endif
    }
}

static void flushIn(void) { int c; while ((c = getchar()) != '\n' && c != EOF); }

static void readLine(char *buf, int n) {
    if (!fgets(buf, n, stdin)) { buf[0] = '\0'; return; }
    size_t L = strlen(buf);
    if (L && buf[L-1] == '\n') buf[L-1] = '\0';
}
static int readInt(const char *prompt, int min, int max) {
    int v; char line[32];
    for (;;) {
        printf("%s", prompt);
        if (!fgets(line, sizeof line, stdin)) return min;
        if (sscanf(line, "%d", &v) == 1 && v >= min && v <= max) return v;
        printf("  ! Enter a number between %d and %d\n", min, max);
    }
}
static int nextId(const char *path, size_t recSize) {
    FILE *f = fopen(path, "rb");
    if (!f) return 1;
    fseek(f, 0, SEEK_END);
    long sz = ftell(f);
    fclose(f);
    return (int)(sz / (long)recSize) + 1;
}
static const char *statusMatch(int s) {
    return s == 0 ? "scheduled" : s == 1 ? "live" : "completed";
}
static const char *statusTourn(int s) {
    return s == 0 ? "upcoming" : s == 1 ? "ongoing" : "completed";
}
static void addPlayer(void) {
    Player p; memset(&p, 0, sizeof p);
    p.id = nextId(PLAYERS_FILE, sizeof p);
    printf("\n-- Add Player --\n");
    printf("Name: ");      readLine(p.name, MAX_NAME);
    p.age = readInt("Age (12-60): ", 12, 60);
    printf("Position: ");  readLine(p.position, MAX_POS);
    printf("Team: ");      readLine(p.team, MAX_NAME);
    p.matches = readInt("Matches played: ", 0, 1000);
    p.goals   = readInt("Goals: ", 0, 10000);
    p.assists = readInt("Assists: ", 0, 10000);
    FILE *f = fopen(PLAYERS_FILE, "ab");
    if (!f) { perror("open players"); return; }
    fwrite(&p, sizeof p, 1, f);
    fclose(f);
    printf("✔ Player saved (id=%d)\n", p.id);
}
static void listPlayers(void) {
    FILE *f = fopen(PLAYERS_FILE, "rb");
    if (!f) { printf("No players yet.\n"); return; }
    Player p; int n = 0;
    printf("\n%-4s %-25s %-4s %-12s %-20s %3s %3s %3s\n",
           "ID","Name","Age","Position","Team","M","G","A");
    printf("--------------------------------------------------------------------------------\n");
    while (fread(&p, sizeof p, 1, f) == 1) {
        printf("%-4d %-25.25s %-4d %-12.12s %-20.20s %3d %3d %3d\n",
               p.id, p.name, p.age, p.position, p.team, p.matches, p.goals, p.assists);
        n++;
    }
    fclose(f);
    printf("--------------------------------------------------------------------------------\n%d player(s)\n", n);
}
static void searchPlayer(void) {
    char q[MAX_NAME];
    printf("Search by name (substring): ");
    readLine(q, MAX_NAME);
    FILE *f = fopen(PLAYERS_FILE, "rb");
    if (!f) { printf("No players.\n"); return; }
    Player p; int n = 0;
    while (fread(&p, sizeof p, 1, f) == 1) {
        if (strstr(p.name, q)) {
            printf("[%d] %s | %s | %s | G:%d A:%d\n", p.id, p.name, p.position, p.team, p.goals, p.assists);
            n++;
        }
    }
    fclose(f);
    printf("%d match(es)\n", n);
}
static void updatePlayer(void) {
    int id = readInt("Player ID to update: ", 1, 1000000);
    FILE *f = fopen(PLAYERS_FILE, "r+b");
    if (!f) { printf("No players.\n"); return; }
    Player p; long pos = -1;
    while (fread(&p, sizeof p, 1, f) == 1) {
        if (p.id == id) { pos = ftell(f) - (long)sizeof p; break; }
    }
    if (pos < 0) { fclose(f); printf("Not found.\n"); return; }
    printf("Editing %s. Press Enter to keep current.\n", p.name);
    char buf[MAX_NAME];
    printf("Name [%s]: ", p.name); readLine(buf, MAX_NAME); if (buf[0]) strncpy(p.name, buf, MAX_NAME-1);
    printf("Team [%s]: ", p.team); readLine(buf, MAX_NAME); if (buf[0]) strncpy(p.team, buf, MAX_NAME-1);
    p.goals   = readInt("Goals: ", 0, 10000);
    p.assists = readInt("Assists: ", 0, 10000);
    p.matches = readInt("Matches: ", 0, 10000);
    fseek(f, pos, SEEK_SET);
    fwrite(&p, sizeof p, 1, f);
    fclose(f);
    printf("✔ Updated.\n");
}
static void deletePlayer(void) {
    int id = readInt("Player ID to delete: ", 1, 1000000);
    FILE *in = fopen(PLAYERS_FILE, "rb");
    FILE *out = fopen("data/_tmp.dat", "wb");
    if (!in || !out) { printf("I/O error.\n"); if (in) fclose(in); if (out) fclose(out); return; }
    Player p; int del = 0;
    while (fread(&p, sizeof p, 1, in) == 1) {
        if (p.id == id) { del = 1; continue; }
        fwrite(&p, sizeof p, 1, out);
    }
    fclose(in); fclose(out);
    remove(PLAYERS_FILE);
    rename("data/_tmp.dat", PLAYERS_FILE);
    printf(del ? "✔ Deleted.\n" : "Not found.\n");
}
static void addTeam(void) {
    Team t; memset(&t, 0, sizeof t);
    t.id = nextId(TEAMS_FILE, sizeof t);
    printf("\n-- Add Team --\n");
    printf("Name: ");  readLine(t.name, MAX_NAME);
    printf("City: ");  readLine(t.city, MAX_CITY);
    printf("Coach: "); readLine(t.coach, MAX_NAME);
    t.founded = readInt("Founded year: ", 1850, 2100);
    FILE *f = fopen(TEAMS_FILE, "ab");
    if (!f) { perror("open teams"); return; }
    fwrite(&t, sizeof t, 1, f);
    fclose(f);
    printf("✔ Team saved (id=%d)\n", t.id);
}
static void listTeams(void) {
    FILE *f = fopen(TEAMS_FILE, "rb");
    if (!f) { printf("No teams yet.\n"); return; }
    Team t; int n = 0;
    printf("\n%-4s %-20s %-15s %-20s %-6s %3s %3s %3s %3s\n",
           "ID","Name","City","Coach","Found","W","D","L","PTS");
    printf("--------------------------------------------------------------------------------\n");
    while (fread(&t, sizeof t, 1, f) == 1) {
        printf("%-4d %-20.20s %-15.15s %-20.20s %-6d %3d %3d %3d %3d\n",
               t.id, t.name, t.city, t.coach, t.founded,
               t.wins, t.draws, t.losses, t.wins*3 + t.draws);
        n++;
    }
    fclose(f);
    printf("--------------------------------------------------------------------------------\n%d team(s)\n", n);
}
static void deleteTeam(void) {
    int id = readInt("Team ID to delete: ", 1, 1000000);
    FILE *in = fopen(TEAMS_FILE, "rb");
    FILE *out = fopen("data/_tmp.dat", "wb");
    if (!in || !out) { printf("I/O error.\n"); if (in) fclose(in); if (out) fclose(out); return; }
    Team t; int del = 0;
    while (fread(&t, sizeof t, 1, in) == 1) {
        if (t.id == id) { del = 1; continue; }
        fwrite(&t, sizeof t, 1, out);
    }
    fclose(in); fclose(out);
    remove(TEAMS_FILE); rename("data/_tmp.dat", TEAMS_FILE);
    printf(del ? "✔ Deleted.\n" : "Not found.\n");
}
static void scheduleMatch(void) {
    Match m; memset(&m, 0, sizeof m);
    m.id = nextId(MATCHES_FILE, sizeof m);
    printf("\n-- Schedule Match --\n");
    printf("Date (YYYY-MM-DD HH:MM): "); readLine(m.date, sizeof m.date);
    printf("Venue: "); readLine(m.venue, MAX_VENUE);
    printf("Team A: "); readLine(m.teamA, MAX_NAME);
    printf("Team B: "); readLine(m.teamB, MAX_NAME);
    if (strcmp(m.teamA, m.teamB) == 0) { printf("! Teams must differ.\n"); return; }
    m.status = 0;
    FILE *f = fopen(MATCHES_FILE, "ab");
    if (!f) { perror("open matches"); return; }
    fwrite(&m, sizeof m, 1, f);
    fclose(f);
    printf("✔ Match scheduled (id=%d)\n", m.id);
}
static void recordResult(void) {
    int id = readInt("Match ID: ", 1, 1000000);
    FILE *f = fopen(MATCHES_FILE, "r+b");
    if (!f) { printf("No matches.\n"); return; }
    Match m; long pos = -1;
    while (fread(&m, sizeof m, 1, f) == 1) {
        if (m.id == id) { pos = ftell(f) - (long)sizeof m; break; }
    }
    if (pos < 0) { fclose(f); printf("Not found.\n"); return; }
    m.scoreA = readInt("Score A: ", 0, 999);
    m.scoreB = readInt("Score B: ", 0, 999);
    m.status = 2;
    fseek(f, pos, SEEK_SET);
    fwrite(&m, sizeof m, 1, f);
    fclose(f);
    printf("✔ Result recorded.\n");
    FILE *tf = fopen(TEAMS_FILE, "r+b");
    if (!tf) return;
    Team t;
    while (fread(&t, sizeof t, 1, tf) == 1) {
        long tpos = ftell(tf) - (long)sizeof t;
        int touched = 0;
        if (strcmp(t.name, m.teamA) == 0) {
            if (m.scoreA > m.scoreB) t.wins++;
            else if (m.scoreA < m.scoreB) t.losses++;
            else t.draws++;
            touched = 1;
        } else if (strcmp(t.name, m.teamB) == 0) {
            if (m.scoreB > m.scoreA) t.wins++;
            else if (m.scoreB < m.scoreA) t.losses++;
            else t.draws++;
            touched = 1;
        }
        if (touched) {
            fseek(tf, tpos, SEEK_SET);
            fwrite(&t, sizeof t, 1, tf);
            fseek(tf, 0, SEEK_CUR);
        }
    }
    fclose(tf);
}
static void listMatches(void) {
    FILE *f = fopen(MATCHES_FILE, "rb");
    if (!f) { printf("No matches.\n"); return; }
    Match m; int n = 0;
    printf("\n%-4s %-17s %-20s %-15s %-15s %-7s %-10s\n",
           "ID","Date","Venue","Team A","Team B","Score","Status");
    printf("--------------------------------------------------------------------------------\n");
    while (fread(&m, sizeof m, 1, f) == 1) {
        char score[16];
        if (m.status == 0) snprintf(score, sizeof score, "  -  ");
        else snprintf(score, sizeof score, "%d - %d", m.scoreA, m.scoreB);
        printf("%-4d %-17.17s %-20.20s %-15.15s %-15.15s %-7s %-10s\n",
               m.id, m.date, m.venue, m.teamA, m.teamB, score, statusMatch(m.status));
        n++;
    }
    fclose(f);
    printf("--------------------------------------------------------------------------------\n%d match(es)\n", n);
}
static void addTournament(void) {
    Tournament t; memset(&t, 0, sizeof t);
    t.id = nextId(TOURNS_FILE, sizeof t);
    printf("\n-- Create Tournament --\n");
    printf("Name: "); readLine(t.name, MAX_NAME);
    printf("Sport: "); readLine(t.sport, MAX_SPORT);
    printf("Start (YYYY-MM-DD): "); readLine(t.startDate, sizeof t.startDate);
    printf("End   (YYYY-MM-DD): "); readLine(t.endDate, sizeof t.endDate);
    t.status = 0;
    FILE *f = fopen(TOURNS_FILE, "ab");
    if (!f) { perror("open tournaments"); return; }
    fwrite(&t, sizeof t, 1, f);
    fclose(f);
    printf("✔ Tournament saved (id=%d)\n", t.id);
}
static void listTournaments(void) {
    FILE *f = fopen(TOURNS_FILE, "rb");
    if (!f) { printf("No tournaments.\n"); return; }
    Tournament t; int n = 0;
    printf("\n%-4s %-25s %-12s %-12s %-12s %-10s\n",
           "ID","Name","Sport","Start","End","Status");
    printf("--------------------------------------------------------------------\n");
    while (fread(&t, sizeof t, 1, f) == 1) {
        printf("%-4d %-25.25s %-12.12s %-12.12s %-12.12s %-10s\n",
               t.id, t.name, t.sport, t.startDate, t.endDate, statusTourn(t.status));
        n++;
    }
    fclose(f);
    printf("--------------------------------------------------------------------\n%d tournament(s)\n", n);
}
static void exportPlayersCSV(void) {
    FILE *f = fopen(PLAYERS_FILE, "rb");
    if (!f) { printf("No players.\n"); return; }
    FILE *out = fopen("data/players_export.csv", "w");
    fprintf(out, "id,name,age,position,team,matches,goals,assists\n");
    Player p;
    while (fread(&p, sizeof p, 1, f) == 1) {
        fprintf(out, "%d,\"%s\",%d,\"%s\",\"%s\",%d,%d,%d\n",
                p.id, p.name, p.age, p.position, p.team, p.matches, p.goals, p.assists);
    }
    fclose(f); fclose(out);
    printf("✔ Wrote data/players_export.csv\n");
}
static void playersMenu(void) {
    for (;;) {
        printf("\n=== Players ===\n");
        printf("1) Add  2) List  3) Search  4) Update  5) Delete  6) Export CSV  0) Back\n");
        int c = readInt("> ", 0, 6);
        switch (c) {
            case 1: addPlayer(); break;
            case 2: listPlayers(); break;
            case 3: searchPlayer(); break;
            case 4: updatePlayer(); break;
            case 5: deletePlayer(); break;
            case 6: exportPlayersCSV(); break;
            case 0: return;
        }
    }
}
static void teamsMenu(void) {
    for (;;) {
        printf("\n=== Teams ===\n1) Add  2) List  3) Delete  0) Back\n");
        int c = readInt("> ", 0, 3);
        switch (c) {
            case 1: addTeam(); break;
            case 2: listTeams(); break;
            case 3: deleteTeam(); break;
            case 0: return;
        }
    }
}
static void matchesMenu(void) {
    for (;;) {
        printf("\n=== Matches ===\n1) Schedule  2) Record Result  3) List  0) Back\n");
        int c = readInt("> ", 0, 3);
        switch (c) {
            case 1: scheduleMatch(); break;
            case 2: recordResult(); break;
            case 3: listMatches(); break;
            case 0: return;
        }
    }
}
static void tournamentsMenu(void) {
    for (;;) {
        printf("\n=== Tournaments ===\n1) Create  2) List  0) Back\n");
        int c = readInt("> ", 0, 2);
        switch (c) {
            case 1: addTournament(); break;
            case 2: listTournaments(); break;
            case 0: return;
        }
    }
}

static void banner(void) {
    printf("\n");
    printf("============================================\n");
    printf("        SportsOPS  -  C Backend v1.0        \n");
    printf("   Sports Management System (Console Mode)  \n");
    printf("============================================\n");
}
int main(void) {
    ensureDir();
    banner();
    for (;;) {
        printf("\n[Main Menu]\n");
        printf("1) Players  2) Teams  3) Matches  4) Tournaments  0) Exit\n");
        int c = readInt("> ", 0, 4);
        switch (c) {
            case 1: playersMenu(); break;
            case 2: teamsMenu(); break;
            case 3: matchesMenu(); break;
            case 4: tournamentsMenu(); break;
            case 0: printf("Goodbye!\n"); return 0;
        }
    }
}
