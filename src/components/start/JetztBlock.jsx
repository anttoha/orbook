import { useNow } from "../../shared/hooks/useNow";
import { useDay, useLessonFilter } from "../../shared/hooks/usePlan";
import { useT } from "../../shared/hooks/useT";
import { usePlanStore } from "../../shared/store/planStore";
import { useUserStore } from "../../shared/store/userStore";
import { berlinParts, lessonProgress, lessonState } from "../../shared/utils/lessonClock";
import { addDays, mineOnly, nextSchoolDay, subjectName, weekdayLong } from "../../shared/utils/format";
import { fachDotClass } from "../../shared/utils/lessons";
import { nextCancelled } from "../../shared/utils/startData";
import BlockCard from "./BlockCard";
import BlockEmpty from "./BlockEmpty";
import BlockSkeleton from "./BlockSkeleton";

const CHANGE_WORD = { substitution: "Vertretung", moved: "Vertretung", added: "Vertretung", room_change: "Raumänderung" };

// «Vertretung · Kle · Raum 204»: что изменилось (цветом акцента), учитель, кабинет
const LessonMeta = ({ lesson }) => {
  const t = useT();
  const word = CHANGE_WORD[lesson.status];
  const rest = [lesson.teacher, lesson.room && `${t("Raum")} ${lesson.room}`].filter(Boolean).join(" · ");
  return (
    <p className="truncate text-body-sm text-muted">
      {word && <span className="font-extrabold text-accent-ink">{t(word)}</span>}
      {word && rest && " · "}
      {rest}
    </p>
  );
};

// ─────────────────────────────────────────────────────────────
// Блок «Jetzt» (макет handy-01): урок, что идёт, сколько осталось, что дальше.
// Перемена или утро — «Gleich». Уроки кончились — первый урок следующего учебного дня.
// ─────────────────────────────────────────────────────────────
const JetztBlock = ({ editing }) => {
  const t = useT();
  const { now, today } = useNow();
  const filter = useLessonFilter();
  const overrides = useUserStore((s) => s.colorOverrides);
  const holidays = usePlanStore((s) => s.meta?.holidays);
  const { day } = useDay(today);
  const nextDate = nextSchoolDay(today, holidays ?? []);
  const { day: nextDay } = useDay(nextDate);
  const card = (props, children) => (
    <BlockCard kind="jetzt" accent to="/heute" editing={editing} {...props}>
      {children}
    </BlockCard>
  );

  if (!day) return card({ title: t("Jetzt") }, <BlockSkeleton />);

  const lessons = day.status === "ok" ? mineOnly(filter(day.lessons)) : [];
  const live = lessonState(lessons, now);
  const lesson = live.current ?? live.next;

  if (lesson) {
    const running = Boolean(live.current);
    const head = `${t(running ? "Jetzt" : "Gleich")} · ${lesson.period}. ${t("Stunde")}`;
    const aside = running ? t("noch {n} min").replace("{n}", live.minutesLeft) : t("in {n} min").replace("{n}", live.breakMinutes);
    const after = running ? live.next : lessons.find((l) => l.start > lesson.start && l.status !== "cancelled");
    const cancelled = nextCancelled(lessons, berlinParts(now).minutes);
    return card(
      { title: head, aside },
      <>
        <div className="flex items-baseline justify-between gap-2">
          <p className="truncate text-number text-ink lg:text-cell">{subjectName(lesson.subject)}</p>
          <p className="shrink-0 text-caption text-faint">{`${lesson.start}–${lesson.end}`}</p>
        </div>
        <LessonMeta lesson={lesson} />
        {running && (
          <div className="mt-auto h-1.5 overflow-hidden rounded-full bg-sand">
            <div className={`h-full rounded-full ${fachDotClass(lesson.subject?.code, overrides)}`} style={{ width: `${lessonProgress(lesson, now) * 100}%` }} />
          </div>
        )}
        <div className={running ? "mt-2 flex items-center gap-2" : "mt-auto flex items-center gap-2"}>
          {cancelled && (
            <p className="flex min-w-0 items-center gap-1.5 truncate text-caption font-bold text-danger">
              <span className="size-1.75 shrink-0 rounded-full bg-danger" />
              {cancelled.start} · <s>{subjectName(cancelled.subject)}</s> {t("fällt aus")}
            </p>
          )}
          {after && <p className="ml-auto shrink-0 truncate text-caption text-faint">{`${t("dann")} ${subjectName(after.subject)} · ${after.start}`}</p>}
        </div>
      </>,
    );
  }

  // Сегодня уроков больше нет — первый урок следующего учебного дня (если неделя уже загружена)
  const first = nextDay?.status === "ok" ? mineOnly(filter(nextDay.lessons)).find((l) => l.status !== "cancelled") : null;
  if (!first) return card({ title: t("Jetzt") }, <BlockEmpty text="Heute kein Unterricht" />);
  const when = nextDate === addDays(today, 1) ? t("Morgen") : weekdayLong(nextDate);
  return card(
    { title: `${when} · ${first.period}. ${t("Stunde")}` },
    <>
      <div className="flex items-baseline justify-between gap-2">
        <p className="truncate text-number text-ink lg:text-cell">{subjectName(first.subject)}</p>
        <p className="shrink-0 text-caption text-faint">{`${first.start}–${first.end}`}</p>
      </div>
      <LessonMeta lesson={first} />
    </>,
  );
};

export default JetztBlock;
