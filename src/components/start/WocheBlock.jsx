import { useNow } from "../../shared/hooks/useNow";
import { useLessonFilter, useWeek } from "../../shared/hooks/usePlan";
import { usePlanView } from "../../shared/hooks/usePlanView";
import { useT } from "../../shared/hooks/useT";
import { usePlanStore } from "../../shared/store/planStore";
import { useUserStore } from "../../shared/store/userStore";
import { cn } from "../../shared/utils/cn";
import { isoWeek, lessonCode, mineOnly, weekdayShort } from "../../shared/utils/format";
import { currentMonday, periodRows } from "../../shared/utils/lessons";
import { subjectLook } from "../../shared/utils/planView";
import MusterBadge from "../muster/MusterBadge";
import BlockCard from "./BlockCard";
import BlockEmpty from "./BlockEmpty";
import BlockSkeleton from "./BlockSkeleton";

// Одна клетка: Kürzel цветом предмета; выпавший урок — пунктир и зачёркнут; точка — в этот урок тест
const MiniCell = ({ lesson, overrides, plan }) => {
  if (!lesson) return <span className="rounded-chip bg-sand/60" />;
  const cancelled = lesson.status === "cancelled";
  return (
    <span
      className={cn(
        "relative grid min-w-0 place-items-center rounded-chip text-caption font-black",
        lesson.muster && !cancelled && "hatch-muster", // из Muster: полосы поверх цвета, как в Woche
        cancelled ? "border border-dashed border-danger bg-danger-tint text-danger line-through" : subjectLook(lesson.subject?.code, overrides, plan),
      )}
    >
      <span className="truncate px-0.5">{lessonCode(lesson)}</span>
      {lesson.examId && <span className="absolute top-1 right-1 size-1.5 rounded-full bg-accent" />}
    </span>
  );
};

// ─────────────────────────────────────────────────────────────
// Блок «Woche» (макет handy-01): эта неделя в миниатюре — Mo–Fr по столбцам, уроки по строкам.
// В выходные — следующая неделя (как вкладка Woche). Если это Muster — метка «Muster» и полосы на клетках
// ─────────────────────────────────────────────────────────────
const WocheBlock = ({ editing }) => {
  const t = useT();
  const { today } = useNow();
  const monday = currentMonday(today);
  const week = useWeek(monday);
  const filter = useLessonFilter();
  const plan = usePlanView();
  const overrides = useUserStore((s) => s.colorOverrides);
  const lessonTimes = usePlanStore((s) => s.meta?.lessonTimes);
  const days = (week.data?.days ?? []).map((day) => ({ ...day, lessons: day.status === "ok" ? mineOnly(filter(day.lessons)) : [] }));
  const isMuster = days.some((day) => day.muster); // неделя целиком или частично из Muster — это не настоящий план
  const rows = periodRows(days, lessonTimes ?? []);

  const body = () => {
    if (!week.data) return week.status === "loading" ? <BlockSkeleton /> : <BlockEmpty text="Plan fehlt noch" />;
    if (!rows.length) return <BlockEmpty text="Diese Woche kein Unterricht" />;
    return (
      <div className="grid min-h-0 flex-1 grid-cols-5 gap-1 lg:gap-1.5" style={{ gridTemplateRows: `auto repeat(${rows.length}, minmax(0, 1fr))` }}>
        {days.map((day) => (
          <span key={day.date} className={cn("pb-0.5 text-center text-tiny font-extrabold tracking-wide uppercase", day.date === today ? "text-accent-ink" : "text-faint")}>
            {weekdayShort(day.date)}
          </span>
        ))}
        {rows.flatMap((row) =>
          days.map((day) => <MiniCell key={`${day.date}-${row.period}`} lesson={day.lessons.find((l) => l.period === row.period)} overrides={overrides} plan={plan} />),
        )}
      </div>
    );
  };

  return (
    <BlockCard kind="woche" title={`${t("Woche")} · KW ${isoWeek(monday)}`} to="/woche" editing={editing} aside={isMuster && <MusterBadge />}>
      {body()}
    </BlockCard>
  );
};

export default WocheBlock;
