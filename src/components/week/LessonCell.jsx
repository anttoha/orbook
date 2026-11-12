import { cn } from "../../shared/utils/cn";
import { lessonBadge, subjectCode, subjectName } from "../../shared/utils/format";
import { fachClasses } from "../../shared/utils/lessons";
import { FlagIcon } from "../ui/icons";

// ─────────────────────────────────────────────────────────────
// Клітинка уроку в сітці тижня (телефон): код предмета + кабінет.
// Це кнопка (клік → шторка уроку). Її обгортає LessonContextMenu, тому всі зайві
// пропси (...props: onClick, onContextMenu, ref від Radix) передаємо прямо на <button>.
// ─────────────────────────────────────────────────────────────
const LessonCell = ({ lesson, isPast, overrides, className, ...props }) => {
  // Спільні класи клітинки; кнопка: текст зліва, без виділення тексту і системного меню iOS
  const base =
    "relative flex min-h-0 flex-1 flex-col justify-between gap-1 overflow-hidden rounded-cell px-2 py-2 text-left leading-none select-none [-webkit-touch-callout:none] transition-transform active:scale-[0.97]";
  const label = [subjectName(lesson.subject), lessonBadge(lesson)].filter(Boolean).join(", "); // для скрінрідера

  // Скасований урок: пунктирна рамка, закреслений код
  if (lesson.status === "cancelled") {
    return (
      <button type="button" aria-label={label} {...props} className={cn(base, "border border-dashed border-faint2", isPast && "opacity-50", className)}>
        <span className="text-hint font-semibold text-faint line-through">{subjectCode(lesson.subject)}</span>
        <span className="truncate text-nano font-bold text-muted">fällt aus</span>
      </button>
    );
  }

  // Чужий курс у режимі «Alle Kurse»: пунктир і сірий текст, без кольору предмета (макет 22)
  if (lesson.notMine) {
    return (
      <button type="button" aria-label={`${label}, nicht dein Kurs`} {...props} className={cn(base, "border border-dashed border-faint2 text-faint", isPast && "opacity-50", className)}>
        <span className="truncate text-hint font-extrabold">{subjectCode(lesson.subject)}</span>
        <span className="truncate text-room font-semibold text-faint2">{lesson.status === "cancelled" ? "fällt aus" : lesson.room}</span>
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
        fachClasses(lesson.subject?.code, overrides), // колір предмета (з урахуванням свого кольору)
        lesson.muster && "hatch-muster", // урок із Muster (частина 19): смуги поверх кольору
        isChanged && "ring-2 ring-accent ring-inset", // рамка у зміни
        isPast && "opacity-45", // минулий урок блідіший
        className,
      )}
    >
      <span className="truncate text-hint font-black">{subjectCode(lesson.subject)}</span>
      <span className={cn("truncate", lesson.examId ? "text-nano font-extrabold text-accent-ink" : "text-room", isChanged && !lesson.examId && "font-extrabold text-accent-ink", !isChanged && !lesson.examId && "font-semibold opacity-85")}>
        {lesson.examId ? "Klausur" : lesson.room}
      </span>

      {/* прапорець Klausur у куті */}
      {lesson.examId && (
        <span className="absolute top-px right-px grid place-items-center rounded-tr-cell rounded-bl-chip bg-accent p-1.25 text-on-accent">
          <FlagIcon className="size-2.5" strokeWidth={3} />
        </span>
      )}
    </button>
  );
};

export default LessonCell;
