import { Lock, Plus } from "lucide-react";
import { useSheet } from "../../shared/hooks/useSheet";
import { useUserStore } from "../../shared/store/userStore";
import { cn } from "../../shared/utils/cn";
import { subjectName } from "../../shared/utils/format";

// ─────────────────────────────────────────────────────────────
// «Meine Notizen»: нотатки до уроків і на день (живуть тільки на пристрої, userStore).
//   variant="list" — телефон: заголовок + окремі картки
//   variant="card" — ПК: усе в одній білій картці (макет «Tag · Liste», права колонка)
// date — "2026-10-07"; lessons — уроки дня (для підпису «Sport · 6. Std»)
// ─────────────────────────────────────────────────────────────
const NotesSection = ({ date, lessons = [], variant = "list" }) => {
  const { openSheet } = useSheet(); // відкрити шторку нотатки
  const allNotes = useUserStore((s) => s.notes); // усі нотатки (фільтр нижче)
  const isCard = variant === "card"; // варіант для ПК?

  // Нотатки цього дня: спочатку до уроків по порядку, потім на день за часом
  const notes = allNotes.filter((n) => n.date === date).sort((a, b) => (a.period ?? 99) - (b.period ?? 99) || a.updatedAt - b.updatedAt);

  // Відкрити нотатку: до уроку — за номером уроку, на день — за id
  const open = (note) => openSheet("notiz", note.period ? { datum: date, stunde: note.period } : { datum: date, id: note.id });

  // Підпис під нотаткою: «Sport · 6. Std · nur für dich»
  const meta = (note) => {
    const lesson = note.period ? lessons.find((l) => l.period === note.period) : null; // урок нотатки
    return lesson ? `${subjectName(lesson.subject)} · ${note.period}. Std · nur für dich` : "nur für dich";
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

      {/* на ПК нотатки йдуть списком із лініями-розділювачами всередині картки */}
      <div className={cn("flex flex-col", isCard ? "mt-1 divide-y divide-hair" : "gap-2.5")}>
        {notes.map((note) => (
          <button key={note.id} type="button" onClick={() => open(note)} className={cn("flex flex-col gap-1.5 text-left", isCard ? "py-3" : "rounded-card bg-card px-3.5 py-3")}>
            <span className={cn("whitespace-pre-wrap text-ink", isCard ? "text-body font-medium" : "text-body-sm")}>{note.text}</span>
            <span className={cn("flex items-center gap-1.5 text-faint", isCard ? "text-caption font-semibold" : "text-note")}>
              <Lock className="size-3" /> {meta(note)}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
};

export default NotesSection;
