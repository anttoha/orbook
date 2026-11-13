import { useT } from "../../shared/hooks/useT";
import { useUserStore } from "../../shared/store/userStore";
import { cn } from "../../shared/utils/cn";
import { subjectName } from "../../shared/utils/format";
import { fachDotClass } from "../../shared/utils/lessons";

// Весь день списком — только на ПК (макет 29 pc-01): классы стоят рядом, и видно, у кого что.
// Пропущенные уроки между первым и последним — строка «frei»
const ClassDayList = ({ lessons, lessonTimes }) => {
  const t = useT();
  const overrides = useUserStore((s) => s.colorOverrides);
  if (lessons.length === 0) return null;
  const last = Math.max(...lessons.map((l) => l.period));
  const rows = Array.from({ length: last }, (_, i) => i + 1).flatMap((period) => {
    const here = lessons.filter((l) => l.period === period);
    return here.length > 0 ? here.map((lesson) => ({ period, lesson })) : [{ period, lesson: null }];
  });

  return (
    <ul className="mt-4 divide-y divide-hair border-t border-hair">
      {rows.map(({ period, lesson }) => {
        const start = lesson?.start ?? lessonTimes?.find((time) => time.period === period)?.start ?? "";
        return (
          <li key={`${period}-${lesson?.course?.nr ?? lesson?.subject?.code ?? "frei"}`} className="flex h-11 items-center gap-2.5 text-label">
            <span className="w-4 shrink-0 font-extrabold text-ink">{period}</span>
            <span className="w-10 shrink-0 text-caption text-faint">{start}</span>
            {lesson ? <LessonLine lesson={lesson} overrides={overrides} t={t} /> : <span className="text-faint2">{t("frei")}</span>}
          </li>
        );
      })}
    </ul>
  );
};

// Предмет и справа «Web · 102» / «Vertretung · Kle · 204» / «fällt aus»
const LessonLine = ({ lesson, overrides, t }) => {
  const cancelled = lesson.status === "cancelled";
  const changed = !cancelled && lesson.status !== "normal";
  const where = [lesson.teacher, lesson.room].filter(Boolean).join(" · ");
  return (
    <>
      <span className={cn("size-2 shrink-0 rounded-full", fachDotClass(lesson.subject?.code, overrides))} />
      <span className={cn("min-w-0 flex-1 truncate text-row font-bold", cancelled ? "text-danger line-through" : "text-ink")}>{subjectName(lesson.subject)}</span>
      <span className={cn("shrink-0 truncate", cancelled ? "font-extrabold text-danger" : changed ? "font-bold text-accent-ink" : "text-faint")}>
        {cancelled ? t("fällt aus") : changed ? [t("Vertretung"), where].filter(Boolean).join(" · ") : where}
      </span>
    </>
  );
};

export default ClassDayList;
