import { cn } from "../../../shared/utils/cn";
import { lessonBadge, subjectName } from "../../../shared/utils/format";
import { fachClasses } from "../../../shared/utils/lessons";

// ─────────────────────────────────────────────────────────────
// Картка уроку в сітці тижня на ПК (макет: 128×77, заокруглення 14px).
//   звичайний — колір предмета, «T25 · 305»
//   зміна     — світло-фіолетовий фон + фіолетова рамка, «VERTRETUNG» / «RAUM»
//   скасований — пунктир, сірий текст, бейдж «FÄLLT AUS»
//   Klausur   — фіолетова рамка + бейдж «KLAUSUR»
//   минулий   — блідіший
// ...props (style, onClick, ref і обробники меню/підказки) йдуть прямо на <button>
// ─────────────────────────────────────────────────────────────
const DesktopLessonCard = ({ lesson, isPast, overrides, className, ...props }) => {
  const isCancelled = lesson.status === "cancelled"; // fällt aus?
  const isChanged = !isCancelled && lesson.status !== "normal"; // Vertretung, Raum, перенос
  const badge = lessonBadge(lesson); // текст бейджа або null

  return (
    <button
      type="button"
      aria-label={[subjectName(lesson.subject), badge].filter(Boolean).join(", ")}
      {...props}
      className={cn(
        "flex min-h-0 flex-col items-start overflow-hidden rounded-[14px] px-2.75 py-2.25 text-left select-none",
        "transition-[transform,box-shadow] outline-none hover:shadow-md focus-visible:ring-2 focus-visible:ring-accent/60 active:scale-[0.98]",
        isCancelled ? "border-[1.5px] border-dashed border-faint2 text-faint" : fachClasses(lesson.subject.code, overrides),
        isChanged && "bg-tint ring-2 ring-accent ring-inset", // зміна: фіолетовий фон і рамка
        lesson.examId && "ring-2 ring-accent ring-inset", // Klausur: фіолетова рамка
        isPast && "opacity-45", // минулий урок
        className,
      )}
    >
      {/* назва предмета */}
      <span className={cn("w-full truncate text-body leading-tight font-extrabold", isCancelled && "line-through")}>{subjectName(lesson.subject)}</span>

      {/* вчитель · кабінет (у скасованого їх немає) */}
      {!isCancelled && (
        <span className={cn("mt-0.5 w-full truncate text-caption", isChanged ? "font-extrabold text-accent-ink" : "font-semibold opacity-75")}>
          {[lesson.teacher, lesson.room].filter(Boolean).join(" · ")}
        </span>
      )}

      {/* бейдж */}
      {badge && (
        <span
          className={cn(
            "mt-1.5 rounded-full px-2 py-0.5 text-micro font-extrabold tracking-wide uppercase",
            isCancelled && "border border-faint2",
            isChanged && "px-0 text-accent-ink",
            lesson.examId && "bg-accent text-on-accent",
          )}
        >
          {badge}
        </span>
      )}
    </button>
  );
};

export default DesktopLessonCard;
