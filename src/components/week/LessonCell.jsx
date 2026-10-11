import { Flag } from "lucide-react";
import { cn } from "../../shared/utils/cn";
import { lessonBadge, subjectName } from "../../shared/utils/format";
import { fachClasses } from "../../shared/utils/lessons";

// ─────────────────────────────────────────────────────────────
// Клітинка уроку в сітці тижня (телефон): код предмета + кабінет.
// Це кнопка (клік → шторка уроку). Її обгортає LessonContextMenu, тому всі зайві
// пропси (...props: onClick, onContextMenu, ref від Radix) передаємо прямо на <button>.
// ─────────────────────────────────────────────────────────────
const LessonCell = ({ lesson, isPast, overrides, className, ...props }) => {
  // Спільні класи клітинки; кнопка: текст зліва, без виділення тексту і системного меню iOS
  const base =
    "relative flex min-h-0 flex-1 flex-col justify-between gap-1 overflow-hidden rounded-[14px] px-2 py-1.75 text-left leading-none select-none [-webkit-touch-callout:none] transition-transform active:scale-[0.97]";
  const label = [subjectName(lesson.subject), lessonBadge(lesson)].filter(Boolean).join(", "); // для скрінрідера

  // Скасований урок: пунктирна рамка, закреслений код
  if (lesson.status === "cancelled") {
    return (
      <button type="button" aria-label={label} {...props} className={cn(base, "border-[1.5px] border-dashed border-faint2 text-faint", isPast && "opacity-50", className)}>
        <span className="text-body-sm font-extrabold line-through">{lesson.subject.code}</span>
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
        fachClasses(lesson.subject.code, overrides), // колір предмета (з урахуванням свого кольору)
        isChanged && "ring-2 ring-accent ring-inset", // рамка у зміни
        isPast && "opacity-45", // минулий урок блідіший
        className,
      )}
    >
      <span className="truncate text-body-sm font-extrabold">{lesson.subject.code}</span>
      <span className={cn("truncate text-small", lesson.examId || isChanged ? "font-extrabold text-accent-ink" : "font-bold opacity-70")}>
        {lesson.examId ? "Klausur" : lesson.room}
      </span>

      {/* прапорець Klausur у куті */}
      {lesson.examId && (
        <span className="absolute top-px right-px grid place-items-center rounded-tr-[14px] rounded-bl-md bg-accent p-1.25 text-on-accent">
          <Flag className="size-2.5" strokeWidth={3} />
        </span>
      )}
    </button>
  );
};

export default LessonCell;
