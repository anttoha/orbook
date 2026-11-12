import { FileText, ListChecks, Sun, Table2 } from "lucide-react";
import { useTheme } from "../../shared/hooks/useTheme";
import { useSyncStore } from "../../shared/store/syncStore";
import { useTasksStore } from "../../shared/store/tasksStore";
import { useUserStore } from "../../shared/store/userStore";
import { visibleNotes } from "../../shared/utils/notes";
import Switch from "../ui/Switch";

const THEME = { light: "Hell", dark: "Dunkel", system: "System" };

// ─────────────────────────────────────────────────────────────
// «Was wird synchronisiert» (макет 25 handy-07): четыре переключателя, у каждого устройства свои.
// Выключенное это устройство не отправляет и не принимает — но и не стирает у других
// ─────────────────────────────────────────────────────────────
const SyncParts = () => {
  const parts = useSyncStore((s) => s.parts);
  const setPart = useSyncStore((s) => s.setPart);
  const notes = useUserStore((s) => visibleNotes(s.notes).length);
  const tasks = useTasksStore((s) => s.tasks.filter((t) => !t.deleted).length);
  const fontScale = useUserStore((s) => s.fontScale);
  const theme = useTheme((s) => s.theme);
  const rows = [
    { key: "notes", icon: FileText, title: "Notizen", hint: `${notes} ${notes === 1 ? "Notiz" : "Notizen"}` },
    { key: "aufgaben", icon: ListChecks, title: "Aufgaben", hint: tasks > 0 ? `erledigt + ${tasks} eigene` : "erledigt + eigene" },
    { key: "kurse", icon: Table2, title: "Meine Kurse", hint: "welche Kurse du siehst" },
    { key: "darstellung", icon: Sun, title: "Darstellung & Fachfarben", hint: `${THEME[theme] ?? "System"} · A${"+".repeat(Math.max(0, fontScale - 1))}` },
  ];

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-hint font-extrabold text-faint">Was wird synchronisiert</h2>
      <ul className="rounded-card bg-card">
        {rows.map((row) => (
          <li key={row.key} className="flex items-center gap-3 border-b border-hair px-3.5 py-3 last:border-0">
            <row.icon className="size-5 shrink-0 text-muted" />
            <span className="min-w-0 flex-1">
              <span className="block text-row text-ink">{row.title}</span>
              <span className="block text-caption text-faint">{row.hint}</span>
            </span>
            <Switch checked={parts[row.key] !== false} onChange={(on) => setPart(row.key, on)} label={row.title} />
          </li>
        ))}
      </ul>
    </section>
  );
};

export default SyncParts;
