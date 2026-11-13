import { FileText, LayoutGrid, ListChecks, Sun, Table2 } from "lucide-react";
import { useT } from "../../shared/hooks/useT";
import { useTheme } from "../../shared/hooks/useTheme";
import { useClasses } from "../../shared/store/classesStore";
import { useSyncStore } from "../../shared/store/syncStore";
import { useTasksStore } from "../../shared/store/tasksStore";
import { useUserStore } from "../../shared/store/userStore";
import { visibleNotes } from "../../shared/utils/notes";
import { cn } from "../../shared/utils/cn";
import Switch from "../ui/Switch";

const THEME = { light: "Hell", dark: "Dunkel", system: "System" };

// ─────────────────────────────────────────────────────────────
// «Was wird synchronisiert» (макет 25 handy-07): четыре-пять переключателей, у каждого устройства свои.
// Выключенное это устройство не отправляет и не принимает — но и не стирает у других
// ─────────────────────────────────────────────────────────────
const SyncParts = () => {
  const parts = useSyncStore((s) => s.parts);
  const setPart = useSyncStore((s) => s.setPart);
  const notes = useUserStore((s) => visibleNotes(s.notes).length);
  const tasks = useTasksStore((s) => s.tasks.filter((t) => !t.deleted).length);
  const fontScale = useUserStore((s) => s.fontScale);
  const theme = useTheme((s) => s.theme);
  const classCount = useClasses((s) => s.list.length);
  const t = useT();
  const rows = [
    { key: "notes", icon: FileText, title: "Notizen", hint: `${notes} ${notes === 1 ? "Notiz" : "Notizen"}` },
    { key: "aufgaben", icon: ListChecks, title: "Aufgaben", hint: tasks > 0 ? `erledigt + ${tasks} eigene` : "erledigt + eigene" },
    { key: "kurse", icon: Table2, title: "Meine Kurse", hint: "welche Kurse du siehst" },
    { key: "darstellung", icon: Sun, title: "Darstellung & Fachfarben", hint: `${THEME[theme] ?? "System"} · A${"+".repeat(Math.max(0, fontScale - 1))}` },
    // Часть 29d: имя, цвет и порядок классов (без Zugangscodes — класс на новом устройстве добавляется своим кодом)
    ...(classCount > 0 ? [{ key: "klassen", icon: LayoutGrid, title: t("Meine Klassen"), hint: t("Name, Farbe, Reihenfolge – ohne Zugangscodes") }] : []),
  ];

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-hint font-extrabold text-faint">Was wird synchronisiert</h2>
      <ul className="overflow-hidden rounded-card bg-card">
        {rows.map((row) => (
          <li key={row.key} className="border-b border-hair last:border-0">
            {/* вся строка — переключатель: попасть пальцем легче, чем в маленький тумблер */}
            <button
              type="button"
              role="switch"
              aria-checked={parts[row.key] !== false}
              onClick={() => setPart(row.key, parts[row.key] === false)}
              className="flex w-full items-center gap-3 px-3.5 py-3 text-left outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-accent/50 active:bg-sand"
            >
              <row.icon className={cn("size-5 shrink-0 transition-colors duration-200", parts[row.key] === false ? "text-faint2" : "text-muted")} />
              <span className="min-w-0 flex-1">
                <span className={cn("block text-row transition-colors duration-200", parts[row.key] === false ? "text-muted" : "text-ink")}>{row.title}</span>
                <span className="block text-caption text-faint">{parts[row.key] === false ? "nur auf diesem Gerät" : row.hint}</span>
              </span>
              <Switch checked={parts[row.key] !== false} />
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default SyncParts;
