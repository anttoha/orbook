import { useNow } from "../../shared/hooks/useNow";
import { useDay, useLessonFilter } from "../../shared/hooks/usePlan";
import { useT } from "../../shared/hooks/useT";
import { usePlanStore } from "../../shared/store/planStore";
import { useUserStore } from "../../shared/store/userStore";
import { cn } from "../../shared/utils/cn";
import { addDays, mineOnly, nextSchoolDay, subjectName, weekdayLong } from "../../shared/utils/format";
import { isLessonNow, isLessonPast } from "../../shared/utils/lessonClock";
import { fachDotClass, freeText } from "../../shared/utils/lessons";
import { isDayDone } from "../../shared/utils/startData";
import MusterBadge from "../muster/MusterBadge";
import BlockCard from "./BlockCard";
import BlockEmpty from "./BlockEmpty";
import BlockSkeleton from "./BlockSkeleton";

// Справа в строке: «fällt aus», «Vertretung · Kle · 204» или просто «Web · 102»
function rowAside(lesson, t) {
  if (lesson.status === "cancelled") return { text: t("fällt aus"), className: "font-extrabold text-danger" };
  const place = [lesson.teacher, lesson.room].filter(Boolean).join(" · ");
  if (["substitution", "moved", "added"].includes(lesson.status)) return { text: [t("Vertretung"), place].filter(Boolean).join(" · "), className: "font-bold text-accent-ink" };
  return { text: place, className: "text-faint" };
}

// ─────────────────────────────────────────────────────────────
// Блок «Heute» (макет pc-01): уроки сегодня списком, идущий — подсвечен.
// Breit — три строки начиная с текущего урока, Groß — весь день.
// «Abends schon morgen»: когда сегодня всё прошло — следующий учебный день.
// ─────────────────────────────────────────────────────────────
const HeuteBlock = ({ block, editing }) => {
  const t = useT();
  const { now, today } = useNow();
  const filter = useLessonFilter();
  const overrides = useUserStore((s) => s.colorOverrides);
  const holidays = usePlanStore((s) => s.meta?.holidays);
  const mineOf = (day) => (day?.status === "ok" ? mineOnly(filter(day.lessons)) : []);

  const { day: todayDay } = useDay(today);
  const done = block.opts.evening && isDayDone(todayDay, mineOf(todayDay), now);
  const nextDate = done ? nextSchoolDay(today, holidays ?? []) : null;
  const { day: nextDay } = useDay(nextDate); // null — ничего не загружает
  // Следующий день ещё не пришёл (или нет сети) — пока показываем сегодня
  const day = nextDay ?? todayDay;
  const date = nextDay ? nextDate : today;

  const lessons = mineOf(day);
  const dayWord = date === today ? t("Heute") : date === addDays(today, 1) ? t("Morgen") : weekdayLong(date);
  const title = lessons.length ? `${dayWord} · ${lessons.length} ${lessons.length === 1 ? t("Stunde") : t("Stunden")}` : dayWord;

  const body = () => {
    if (!day) return <BlockSkeleton />;
    if (!lessons.length) {
      const empty = date === today ? t("Heute kein Unterricht") : t(freeText(day) ?? "Kein Unterricht");
      return <BlockEmpty text={empty} />;
    }
    const from = block.size === "gross" ? 0 : Math.max(0, lessons.findIndex((l) => !isLessonPast(l, date, now)));
    const shown = block.size === "gross" ? lessons : lessons.slice(from, from + 3);
    return (
      <ul className="-mx-1.5 flex flex-col divide-y divide-hair">
        {shown.map((lesson) => {
          const aside = rowAside(lesson, t);
          const cancelled = lesson.status === "cancelled";
          return (
            <li key={`${lesson.period}-${lesson.subject?.code}`} className={cn("flex items-center gap-2.5 rounded-tile px-1.5 py-1.5 lg:py-2", isLessonNow(lesson, date, now) && "bg-tint")}>
              <span className="w-3 shrink-0 text-center text-body-sm font-extrabold text-ink">{lesson.period}</span>
              <span className="w-9 shrink-0 text-caption text-faint">{lesson.start}</span>
              <span className={cn("size-2 shrink-0 rounded-full", cancelled ? "bg-danger" : fachDotClass(lesson.subject?.code, overrides))} />
              <span className={cn("min-w-0 flex-1 truncate text-body-sm font-bold", cancelled ? "text-danger line-through" : "text-ink")}>{subjectName(lesson.subject)}</span>
              {aside.text && <span className={cn("max-w-[45%] shrink-0 truncate text-caption", aside.className)}>{aside.text}</span>}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <BlockCard kind="heute" title={title} to={date === today ? "/heute" : `/tag/${date}`} editing={editing} aside={lessons.some((l) => l.muster) && <MusterBadge />}>
      {body()}
    </BlockCard>
  );
};

export default HeuteBlock;
