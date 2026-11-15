# ORBook

Stundenplan-App für meine Schulklasse: Plan und Vertretungen live, dazu Tests, Hausaufgaben, Termine und Notizen. Läuft im Browser und lässt sich als App (PWA) auf dem Handy installieren.

- **Demo zum Ausprobieren:** https://orbook-demo.orbitium.net
  Alle Daten sind erfunden. Auf der Startseite stehen fertige Codes für Schüler:in, Lehrkraft und Editor, ein Klick reicht. Die Demo wird jede Nacht zurückgesetzt.
- **Live:** https://orbook.orbitium.net
  Das echte ORBook meiner Klasse, nur mit Zugangscode oder Klassenpasswort.

> Mit KI (Claude Code) entwickelt – meine Rolle: Idee, Anforderungen, Tests, Betrieb.

## Was die App kann

- **Woche und Heute:** Stundenplan mit Vertretungen, Ausfällen und Raumänderungen. Neue Pläne kommen live, ohne Neuladen (Server-Sent Events).
- **Verlauf des Tages:** welche Fassung des Plans wann kam und was sich geändert hat.
- **Tests, Hausaufgaben, Termine:** für die ganze Klasse eintragen, mit Kürzeln wie KA oder T, sichtbar im Plan.
- **Materialien:** Links zu Drive oder OneDrive, sortiert nach Fach.
- **Notizen und Sync:** Notizen bleiben auf dem Gerät. Für den Abgleich zwischen Geräten werden sie verschlüsselt.
- **Zugänge:** Zugangscodes und Einladungslink für Schüler:innen, eigene Codes für Lehrkräfte und Editor:innen. Kein Konto, keine E-Mail.
- **Mehrere Klassen und Schulen** auf einem Gerät, nebeneinander oder einzeln.
- **Mitteilungen:** Web Push und ein Telegram-Bot, wenn sich der Plan ändert oder morgen ein Test ist.
- **Start aus Blöcken,** frei anordnen, dazu drei Designs (Soft, Glas, Klar) und eigene Fachfarben.
- **Statistik:** ausgefallene und vertretene Stunden.
- **Sprachen:** Deutsch, English, Українська.
- **Admin-Bereich** für Codes, Klassen, Muster-Plan, Kanäle und Protokoll.

## Technik

| Bereich | Werkzeuge |
|---|---|
| Frontend (dieses Repo) | React 19, Vite, JavaScript |
| Styling | Tailwind CSS v4 (Design-Tokens in `src/index.css`) |
| Zustand und Routing | Zustand, React Router |
| UI-Bausteine | Radix UI, lucide-react, vaul, sonner, dnd-kit |
| Tests | Vitest, ESLint |
| Backend (eigenes Repo) | Python, FastAPI, SQLite; holt den Plan von stundenplan24.de |

Ablauf: Push auf `main` geht automatisch auf die Demo. Ein Tag `vX.Y.Z` veröffentlicht ein GitHub-Release und geht auf Live.

## Lokal starten

```bash
npm install
npm run dev      # http://localhost:5173, /api geht an die Demo
npm test
npm run build
```

## Hinweis

ORBook ist keine offizielle App von Indiware oder stundenplan24.de. Im Repo liegen keine echten Daten von Schule, Lehrkräften oder Schüler:innen.
