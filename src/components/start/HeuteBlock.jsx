import { useNow } from "../../shared/hooks/useNow";
import { useDay, useLessonFilter } from "../../shared/hooks/usePlan";
import { useT } from "../../shared/hooks/useT";
import { useUserStore } from "../../shared/store/userStore";
import { cn } from "../../shared/utils/cn";
import { mineOnly, subjectName } from "../../shared/utils/format";
import { isLessonNow, isLessonPast } from "../../shared/utils/lessonClock";
import { fachDotClass } from "../../shared/utils/lessons";
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
// ─────────────────────────────────────────────────────────────
const HeuteBlock = ({ block, editing }) => {
  const t = useT();
  const { now, today } = useNow();
  const filter = useLessonFilter();
  const overrides = useUserStore((s) => s.colorOverrides);
  const { day } = useDay(today);
  const lessons = day?.status === "ok" ? mineOnly(filter(day.lessons)) : [];
  const title = lessons.length ? `${t("Heute")} · ${lessons.length} ${t(lessons.length === 1 ? "Stunde" : "Stunden")}` : t("Heute");

  const body = () => {
    if (!day) return <BlockSkeleton />;
    if (!lessons.length) return <BlockEmpty text="Heute kein Unterricht" />;
    const from = block.size === "gross" ? 0 : Math.max(0, lessons.findIndex((l) => !isLessonPast(l, today, now)));
    const shown = block.size === "gross" ? lessons : lessons.slice(from, from + 3);
    return (
      <ul className="-mx-1.5 flex flex-col divide-y divide-hair">
        {shown.map((lesson) => {
          const aside = rowAside(lesson, t);
          const cancelled = lesson.status === "cancelled";
          return (
            <li key={`${lesson.period}-${lesson.subject?.code}`} className={cn("flex items-center gap-2.5 rounded-tile px-1.5 py-1.5 lg:py-2", isLessonNow(lesson, today, now) && "bg-tint")}>
              <span className="w-3 shrink-0 text-center text-body-sm font-extrabold text-ink">{lesson.period}</span>
              <span className="w-9 shrink-0 text-caption text-faint">{lesson.start}</span>
              <span className={cn("size-2 shrink-0 rounded-full", cancelled ? "bg-danger" : fachDotClass(lesson.subject?.code, overrides))} />
              <span className={cn("min-w-0 flex-1 truncate text-body-sm font-bold", cancelled ? "text-danger line-through" : "text-ink")}>{subjectName(lesson.subject)}</span>
              {aside.text && <span className={cn("shrink-0 truncate text-caption", aside.className)}>{aside.text}</span>}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <BlockCard kind="heute" title={title} to="/heute" editing={editing} aside={lessons.some((l) => l.muster) && <MusterBadge />}>
      {body()}
    </BlockCard>
  );
};

export default HeuteBlock;
