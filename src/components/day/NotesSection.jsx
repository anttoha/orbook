import { Plus } from "lucide-react";
import { useSyncOn } from "../../shared/hooks/useNotesSync";
import { useSheet } from "../../shared/hooks/useSheet";
import { usePlanStore } from "../../shared/store/planStore";
import { useUserStore } from "../../shared/store/userStore";
import { cn } from "../../shared/utils/cn";
import { lessonName } from "../../shared/utils/format";
import { noteMeta, visibleNotes } from "../../shared/utils/notes";
import { LockIcon, SyncIcon } from "../ui/icons";

// ─────────────────────────────────────────────────────────────
// «Meine Notizen»: нотатки до уроків і на день (живуть тільки на пристрої, userStore).
//   variant="list" — телефон: заголовок + окремі картки
//   variant="card" — ПК: усе в одній білій картці (макет «Tag · Liste», права колонка)
// date — "2026-10-07"; lessons — уроки дня (для підпису «Sport · 6. Std»)
// hideEmpty — без нотаток секції немає (день без плану на телефоні: у макеті там тільки стан дня)
// ─────────────────────────────────────────────────────────────
const NotesSection = ({ date, lessons = [], variant = "list", hideEmpty = false }) => {
  const { openSheet } = useSheet(); // відкрити шторку нотатки
  const allNotes = useUserStore((s) => s.notes); // усі нотатки (фільтр нижче)
  const isCard = variant === "card"; // варіант для ПК?
  const subjectNames = usePlanStore((s) => s.meta?.subjects); // назви предметів { Ma: "Mathe" }
  const synced = useSyncOn(); // є Sync-Code і школа не вимкнула синхронізацію
  const NoteIcon = synced ? SyncIcon : LockIcon; // значок під нотаткою: синхронізується чи лише на пристрої

  // Нотатки цього дня: спочатку до уроків по порядку, потім на день за часом
  const notes = visibleNotes(allNotes)
    .filter((n) => n.date === date)
    .sort((a, b) => (a.period ?? 99) - (b.period ?? 99) || a.updatedAt.localeCompare(b.updatedAt));

  if (hideEmpty && notes.length === 0) return null;

  // Відкрити нотатку: до уроку — за номером уроку, на день — за id
  const open = (note) => openSheet("notiz", note.period ? { datum: date, stunde: note.period } : { datum: date, id: note.id });

  // Підпис під нотаткою (макет): телефон — «synchronisiert · nur für dich», ПК — «Sport · 6. Std · nur für dich».
  // Предмет — з уроку (до уроку) або вибраний у нотатці; без синхронізації і на телефоні показуємо предмет
  const meta = (note) => {
    if (synced && !isCard) return "synchronisiert";
    const lesson = note.period ? lessons.find((l) => l.period === note.period) : null;
    const label = lesson ? lessonName(lesson) : note.subject ? (subjectNames?.[note.subject] ?? note.subject) : null;
    return noteMeta(label, note.period);
  };

  return (
    <section className={cn("flex flex-col", isCard ? "rounded-card bg-card p-4" : "mt-2 gap-2.5")}>
      <header className="flex items-center justify-between">
        <h2 className={cn("font-extrabold text-faint", isCard ? "text-label" : "text-hint")}>Meine Notizen</h2>
        {/* нова нотатка на день */}
        <button type="button" onClick={() => openSheet("notiz", { datum: date })} className={cn("flex items-center gap-1 text-label", isCard ? "font-extrabold text-accent" : "font-bold text-accent-ink")}>
          <Plus className="size-3.5" strokeWidth={3} /> Notiz
        </button>
      </header>

      {notes.length === 0 && <p className={cn("text-label text-faint", isCard ? "mt-2.5 font-bold" : "rounded-card bg-card px-3.5 py-3")}>Noch keine Notizen für diesen Tag.</p>}
      {/* подсказка про записи на урок (макет 24 handy-07): на ПК — правый клик, на телефоне — долгое нажатие */}
      {notes.length === 0 && !isCard && <p className="mt-2 text-label text-faint">Lange auf eine Stunde drücken: Hausaufgabe oder Test eintragen.</p>}

      {/* на ПК нотатки йдуть списком із лініями-розділювачами всередині картки */}
      <div className={cn("flex flex-col", isCard ? "mt-1 divide-y divide-hair" : "gap-2.5")}>
        {notes.map((note) => (
          <button key={note.id} type="button" onClick={() => open(note)} className={cn("flex flex-col gap-1.5 text-left", isCard ? "py-3" : "rounded-card bg-card px-3.5 py-3")}>
            <span className={cn("whitespace-pre-wrap text-ink", isCard ? "text-body font-medium" : "text-body-sm")}>{note.text}</span>
            <span className={cn("flex items-center gap-1.5 text-faint", isCard ? "text-caption font-semibold" : "text-note")}>
              <NoteIcon className="size-3 shrink-0" /> {meta(note)}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
};

export default NotesSection;
