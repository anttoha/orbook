import { Plus } from "lucide-react";
import { cn } from "../../../shared/utils/cn";
import { fachClasses } from "../../../shared/utils/lessons";

// Один курс у клітинці. Телефон: код і кабінет; ПК: назва, «вчитель · кабінет».
// Кілька курсів в уроці (Kunst | Bio) — смужки одна під одною, лише назва
const Entry = ({ lesson, names, desktop, compact, hatched }) => (
  <span className={cn("flex min-h-0 flex-1 flex-col justify-between overflow-hidden rounded-cell px-2 py-2 leading-none", fachClasses(lesson.subject), hatched && "hatch-muster", compact && "justify-center py-1")}>
    <span className={cn("truncate font-black", desktop ? "text-body-sm" : "text-hint")}>{desktop ? (names[lesson.subject] ?? lesson.subject) : lesson.subject}</span>
    {!compact && <span className={cn("truncate opacity-75", desktop ? "text-label" : "text-room font-semibold")}>{desktop ? [lesson.teacher, lesson.room].filter(Boolean).join(" · ") : lesson.room}</span>}
  </span>
);

// ─────────────────────────────────────────────────────────────
// Клітинка сітки Muster (макети 19b handy-02/03, pc-01/03).
//   mode "auto"  — лише дивитись: заштриховано, як Muster у застосунку, не кнопка
//   mode "admin" — кнопка: колір предмета, порожня — пунктир із «+»
// changed — своя правка (крапка в куті), selected — відкрита зараз (рамка)
// ─────────────────────────────────────────────────────────────
const MusterCell = ({ entries, mode, names = {}, desktop = false, changed = false, selected = false, label, onClick }) => {
  const box = "relative flex h-full w-full flex-col gap-0.75 rounded-cell text-left";
  const compact = entries.length > 1;

  if (mode === "auto") {
    if (!entries.length) return <div aria-hidden className="h-full rounded-cell bg-sand opacity-60" />;
    return (
      <div className={box}>
        {entries.map((lesson) => (
          <Entry key={`${lesson.subject}-${lesson.course?.nr}`} lesson={lesson} names={names} desktop={desktop} compact={compact} hatched />
        ))}
      </div>
    );
  }

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        box,
        "transition-transform outline-none select-none focus-visible:ring-2 focus-visible:ring-accent/50 active:scale-[0.97]",
        !entries.length && "items-center justify-center border border-dashed border-faint2 text-faint hover:bg-card",
        selected && "ring-2 ring-accent ring-offset-2 ring-offset-paper",
      )}
    >
      {entries.length ? entries.map((lesson) => <Entry key={`${lesson.subject}-${lesson.course?.nr}`} lesson={lesson} names={names} desktop={desktop} compact={compact} />) : <Plus className="size-4" />}
      {changed && <span aria-hidden className="absolute top-1.5 right-1.5 size-2 rounded-full bg-accent" />}
    </button>
  );
};

export default MusterCell;
