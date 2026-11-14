import { cn } from "../../shared/utils/cn";
import { lessonBadge, lessonName } from "../../shared/utils/format";
import { cellTitle, PLAN_DEFAULTS, subjectLook } from "../../shared/utils/planView";
import { FlagIcon } from "../ui/icons";

// ─────────────────────────────────────────────────────────────
// Клітинка уроку в сітці тижня (телефон): код предмета + кабінет.
// Це кнопка (клік → шторка уроку). Її обгортає LessonContextMenu, тому всі зайві
// пропси (...props: onClick, onContextMenu, ref від Radix) передаємо прямо на <button>.
// ─────────────────────────────────────────────────────────────
// examShort — Kürzel вида Test («KA», «LK»; часть 24) вместо слова в клетке
// plan — «Darstellung → Stundenplan» (частина 30b): назва, вчитель/кабінет, колір предмета
const LessonCell = ({ lesson, isPast, overrides, examShort, plan = PLAN_DEFAULTS, className, ...props }) => {
  // Спільні класи клітинки; кнопка: текст зліва, без виділення тексту і системного меню iOS
  const base =
    "relative flex min-h-0 flex-1 flex-col justify-between gap-1 overflow-hidden rounded-cell px-2 py-2 text-left leading-none select-none [-webkit-touch-callout:none] transition-transform active:scale-[0.97]";
  const label = [lessonName(lesson), lessonBadge(lesson)].filter(Boolean).join(", "); // для скрінрідера
  const room = plan.showRoom ? lesson.room : null; // кабінет унизу (якщо ввімкнено)
  const teacher = plan.showTeacher && !lesson.examId ? lesson.teacher : null; // вчитель — праворуч від назви, як на макеті 30 · handy-13

  // Скасований урок: пунктирна рамка, закреслений код
  if (lesson.status === "cancelled") {
    return (
      <button type="button" aria-label={label} {...props} className={cn(base, "border border-dashed border-faint2", isPast && "opacity-50", className)}>
        <span className="truncate text-hint font-semibold text-faint line-through">{cellTitle(lesson, plan)}</span>
        <span className="truncate text-nano font-bold text-muted">fällt aus</span>
      </button>
    );
  }

  // Чужий курс у режимі «Alle Kurse»: пунктир і сірий текст, без кольору предмета (макет 22)
  if (lesson.notMine) {
    return (
      <button type="button" aria-label={`${label}, nicht dein Kurs`} {...props} className={cn(base, "border border-dashed border-faint2 text-faint", isPast && "opacity-50", className)}>
        <span className="truncate text-hint font-extrabold">{cellTitle(lesson, plan)}</span>
        <span className="truncate text-room font-semibold text-faint2">{room || "\u00a0"}</span>
      </button>
    );
  }

  const isChanged = lesson.status !== "normal"; // Vertretung, Raumänderung, перенос

  return (
    <button
      type="button"
      aria-label={label}
      {...props}
      className={cn(
        base,
        subjectLook(lesson.subject?.code, overrides, plan), // колір предмета: заливка / смужка / без кольору
        lesson.muster && "hatch-muster", // урок із Muster (частина 19): смуги поверх кольору
        isChanged && "ring-2 ring-accent ring-inset", // рамка у зміни
        isPast && "opacity-45", // минулий урок блідіший
        className,
      )}
    >
      <span className="flex min-w-0 items-baseline justify-between gap-1">
        <span className="truncate text-hint font-black">{cellTitle(lesson, plan)}</span>
        {teacher && <span className="shrink-0 text-nano font-semibold opacity-85">{teacher}</span>}
      </span>
      <span className={cn("truncate", lesson.examId ? "text-nano font-extrabold text-accent-ink" : "text-room", isChanged && !lesson.examId && "font-extrabold text-accent-ink", !isChanged && !lesson.examId && "font-semibold opacity-85")}>
        {lesson.examId ? (examShort ?? "Test") : room || "\u00a0"}
      </span>

      {/* прапорець Test у куті */}
      {lesson.examId && (
        <span className="absolute top-px right-px grid place-items-center rounded-tr-cell rounded-bl-chip bg-accent p-1.25 text-on-accent">
          <FlagIcon className="size-2.5" strokeWidth={3} />
        </span>
      )}
    </button>
  );
};

export default LessonCell;
