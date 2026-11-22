import { ClipboardCheck, FileText, LayoutGrid, ListChecks, Sun, Table2 } from "lucide-react";
import { useT } from "../../shared/hooks/useT";
import { useTheme } from "../../shared/hooks/useTheme";
import { useClasses } from "../../shared/store/classesStore";
import { useSyncStore } from "../../shared/store/syncStore";
import { useTasksStore } from "../../shared/store/tasksStore";
import { useUserStore } from "../../shared/store/userStore";
import { usePlanStore } from "../../shared/store/planStore";
import { useKartenStore } from "../../shared/store/kartenStore";
import { liveDecks } from "../../shared/utils/karten";
import { KartenIcon } from "../ui/icons";
import { visibleNotes } from "../../shared/utils/notes";
import { cn } from "../../shared/utils/cn";
import RowSwitch from "../ui/RowSwitch";
import Liquid from "../ui/Liquid";
import { translate } from "../../shared/i18n/translate";

const THEME = { get light() { return translate("Hell"); }, get dark() { return translate("Dunkel"); }, get system() { return translate("System"); } };

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
  const noten = usePlanStore((s) => s.me?.features?.noten === true);
  const decks = useKartenStore((s) => liveDecks(s.decks).length);
  const t = useT();
  const rows = [
    { key: "notes", icon: FileText, title: translate("Notizen"), hint: `${notes} ${notes === 1 ? translate("Notiz") : translate("Notizen")}` },
    { key: "aufgaben", icon: ListChecks, title: translate("Aufgaben"), hint: tasks > 0 ? translate("erledigt + {tasks} eigene", { tasks }) : translate("erledigt + eigene") },
    { key: "kurse", icon: Table2, title: translate("Meine Kurse"), hint: translate("welche Kurse du siehst") },
    { key: "darstellung", icon: Sun, title: "Darstellung & Fachfarben", hint: `${THEME[theme] ?? translate("System")} · A${"+".repeat(Math.max(0, fontScale - 1))}` },
    // Часть 29d: имя, цвет и порядок классов (без Zugangscodes — класс на новом устройстве добавляется своим кодом)
    ...(classCount > 0 ? [{ key: "klassen", icon: LayoutGrid, title: t("Meine Klassen"), hint: t("Name, Farbe, Reihenfolge – ohne Zugangscodes") }] : []),
    // Часть 36b: только оценки — логин InfoPoint остаётся на устройстве
    ...(noten ? [{ key: "noten", icon: ClipboardCheck, title: t("Noten"), hint: t("geholte Noten, ohne Login") }] : []),
    // Часть 43: стопки и Lernstand (отдельным блоком)
    { key: "karten", icon: KartenIcon, title: t("Karteikarten"), hint: decks === 1 ? t("1 Stapel") : t("{decks} Stapel", { decks }) },
  ];

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-hint font-extrabold text-faint">{t("Was wird synchronisiert")}</h2>
      <Liquid as="ul" refract press={false} className="overflow-hidden rounded-card bg-card">
        {rows.map((row) => (
          <li key={row.key} className="border-b border-hair last:border-0">
            {/* вся строка — переключатель: попасть пальцем легче, чем в маленький тумблер */}
            <RowSwitch
              checked={parts[row.key] !== false}
              onToggle={() => setPart(row.key, parts[row.key] === false)}
              label={row.title}
              className="flex w-full items-center gap-3 px-3.5 py-3 text-left outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-accent/50 active:bg-sand"
            >
              <row.icon className={cn("size-5 shrink-0 transition-colors duration-200", parts[row.key] === false ? "text-faint2" : "text-muted")} />
              <span className="min-w-0 flex-1">
                <span className={cn("block text-row transition-colors duration-200", parts[row.key] === false ? "text-muted" : "text-ink")}>{row.title}</span>
                <span className="block text-caption text-faint">{parts[row.key] === false ? translate("aus") : row.hint}</span>
              </span>
            </RowSwitch>
          </li>
        ))}
      </Liquid>
    </section>
  );
};

export default SyncParts;
