import { useNow } from "../../shared/hooks/useNow";
import { useDay, useLessonFilter } from "../../shared/hooks/usePlan";
import { useT } from "../../shared/hooks/useT";
import { usePlanStore } from "../../shared/store/planStore";
import { cn } from "../../shared/utils/cn";
import { mineOnly, nextSchoolDay, subjectName, weekdayShort } from "../../shared/utils/format";
import { changesSoon } from "../../shared/utils/startData";
import BlockCard from "./BlockCard";
import BlockEmpty from "./BlockEmpty";
import BlockSkeleton from "./BlockSkeleton";

// Одна строка: что случилось (крупно) и где («3. Stunde · Kle · 204»)
const ChangeRow = ({ change, today, t }) => {
  const { lesson, date } = change;
  const name = subjectName(lesson.subject);
  const cancelled = lesson.status === "cancelled";
  const roomOnly = lesson.status === "room_change";
  const when = [date !== today && weekdayShort(date), `${lesson.period}. ${t("Stunde")}`].filter(Boolean).join(" · ");
  const where = cancelled ? when : [when, lesson.teacher, lesson.room].filter(Boolean).join(" · ");
  return (
    <li className="min-w-0">
      <p className={cn("truncate text-body-sm font-extrabold", cancelled ? "text-danger" : "text-accent-ink")}>
        {cancelled ? (
          <>
            <s>{name}</s> {t("fällt aus")}
          </>
        ) : (
          `${name} ${t(roomOnly ? "in anderem Raum" : "vertreten")}`
        )}
      </p>
      <p className="truncate text-caption text-faint">{where}</p>
    </li>
  );
};

// ─────────────────────────────────────────────────────────────
// Блок «Änderungen» (макет handy-01): Ausfall и Vertretung сегодня и в следующий учебный день
// ─────────────────────────────────────────────────────────────
const AenderungenBlock = ({ editing }) => {
  const t = useT();
  const { today } = useNow();
  const filter = useLessonFilter();
  const holidays = usePlanStore((s) => s.meta?.holidays);
  const nextDate = nextSchoolDay(today, holidays ?? []);
  const { day } = useDay(today);
  const { day: next } = useDay(nextDate);
  const days = [day, next].filter(Boolean).map((d) => ({ ...d, lessons: d.status === "ok" ? mineOnly(filter(d.lessons)) : [] }));
  const changes = changesSoon(days, today, nextDate).slice(0, 2);

  const body = () => {
    if (!day) return <BlockSkeleton />;
    if (!changes.length) return <BlockEmpty text="Keine Änderungen" />;
    return (
      <ul className="flex flex-col gap-2">
        {changes.map((change) => (
          <ChangeRow key={`${change.date}-${change.lesson.period}-${change.lesson.subject?.code}`} change={change} today={today} t={t} />
        ))}
      </ul>
    );
  };

  return (
    <BlockCard kind="aenderungen" title={t("Änderungen")} to="/heute" editing={editing}>
      {body()}
    </BlockCard>
  );
};

export default AenderungenBlock;
