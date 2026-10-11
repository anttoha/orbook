import * as Tooltip from "@radix-ui/react-tooltip";
import { lessonBadge, subjectName } from "../../shared/utils/format";
import { lessonNote } from "../../shared/utils/lessons";

// ─────────────────────────────────────────────────────────────
// Підказка при наведенні мишкою на урок (тільки ПК — на телефоні
// Radix Tooltip сам не відкривається від дотику).
// ...props передаємо в Tooltip.Trigger: так компонент можна класти
// всередину LessonContextMenu (той передає свої обробники далі).
// ─────────────────────────────────────────────────────────────
const LessonTooltip = ({ lesson, children, ...props }) => {
  const badge = lessonBadge(lesson); // «VERTRETUNG» / «FÄLLT AUS» / «KLAUSUR» / null
  const note = lessonNote(lesson, null); // пояснення школи / перенос

  // Рядок про вчителя і кабінет: при заміні — «T26 statt T25 · Raum 305»
  const oldTeacher = lesson.changes?.teacher?.old;
  const teacher = oldTeacher ? `${lesson.teacher} statt ${oldTeacher}` : lesson.teacher;
  const details = [lesson.start && `${lesson.start}–${lesson.end}`, teacher, lesson.room && `Raum ${lesson.room}`].filter(Boolean).join(" · ");

  return (
    <Tooltip.Root>
      {/* onFocus + preventDefault: підказка тільки від миші, а не коли фокус
          повертається на урок після закриття панелі (інакше висіла б поверх) */}
      <Tooltip.Trigger asChild {...props} onFocus={(event) => event.preventDefault()}>
        {children}
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          side="top"
          sideOffset={6}
          className="z-50 max-w-64 rounded-xl bg-ink px-3 py-2 text-caption font-semibold text-paper shadow-lg data-[state=closed]:animate-fade-out data-[state=delayed-open]:animate-fade-in"
        >
          <p className="text-body-sm font-extrabold">
            {subjectName(lesson.subject)} · {lesson.period}. Std
          </p>
          {details && <p className="opacity-80">{details}</p>}
          {badge && <p className="mt-0.5 font-extrabold text-today-sub">{badge}</p>}
          {note && <p className="opacity-80">{note}</p>}
          <Tooltip.Arrow className="fill-ink" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
};

export default LessonTooltip;
