import { CalendarDays, ListChecks, RefreshCw, Sparkle } from "lucide-react";
import { useNow } from "../../shared/hooks/useNow";
import { useT } from "../../shared/hooks/useT";
import { usePlanStore } from "../../shared/store/planStore";
import { useUserStore } from "../../shared/store/userStore";
import { timeText } from "../../shared/utils/appointments";
import { cn } from "../../shared/utils/cn";
import { addDays, longDate, numericDate, subjectName, weekdayLong, weekdayShort } from "../../shared/utils/format";
import { fachDotClass } from "../../shared/utils/lessons";
import { keyLessons } from "../../shared/utils/nowFocus";
import { dueText } from "../../shared/utils/tasks";
import { degrees } from "../../shared/utils/weather";
import BlockCard from "../start/BlockCard";
import BlockEmpty from "../start/BlockEmpty";
import { FlagIcon } from "../ui/icons";
import WeatherIcon from "../weather/WeatherIcon";
import { InfoRow, LessonList, PartTitle } from "./FocusParts";

// Справа в шапке: «☁ 15° / 8°» (short — в Klein только «☁ 15°»)
const WeatherAside = ({ day, short = false }) =>
  day && (
    <span className="flex items-center gap-1.5">
      <WeatherIcon code={day.code} className="size-4 text-muted" strokeWidth={2} />
      {short ? degrees(day.tMax) : `${degrees(day.tMax)} / ${degrees(day.tMin)}`}
    </span>
  );

const shortDay = (iso) => `${weekdayShort(iso)} ${numericDate(iso)}`;

// «Mathe · S. 54, Nr. 3»
const homeworkText = (row, names) => [row.subject && (names?.[row.subject] ?? row.subject), row.text].filter(Boolean).join(" · ");

// Задания на завтра: квадратик (как в списке Aufgaben), точка предмета, «bis morgen»
const HomeworkRow = ({ row, names, today }) => {
  const overrides = useUserStore((s) => s.colorOverrides);
  return (
    <li className="flex items-center gap-2.5 py-1">
      <span aria-hidden="true" className="size-5 shrink-0 rounded-chip border-2 border-hair" />
      {row.subject && <span className={cn("size-2 shrink-0 rounded-full", fachDotClass(row.subject, overrides))} />}
      <span className="min-w-0 flex-1 truncate text-body-sm font-semibold text-ink">{homeworkText(row, names)}</span>
      <span className="shrink-0 text-caption font-bold text-accent-ink">{dueText(row.due, today)}</span>
    </li>
  );
};

// Строки «Nächster Schultag»: задания, тесты, Termine, изменения дня
function aheadRows(focus, { t, names, today }) {
  const rows = [
    ...focus.homework.map((row) => ({ key: row.key, icon: ListChecks, text: homeworkText(row, names), aside: dueText(row.due, today) })),
    ...focus.exams.map((exam) => ({ key: `e-${exam.id}`, icon: FlagIcon, text: t("Test: {fach}", { fach: subjectName(exam.subject) }), aside: shortDay(exam.date), asideClass: "text-faint" })),
    ...focus.appointments.map((item) => ({ key: `a-${item.id}`, icon: CalendarDays, text: item.title, aside: timeText(item), asideClass: "text-faint" })),
    ...focus.changes.map((lesson) => {
      const cancelled = lesson.status === "cancelled";
      const text = cancelled ? `${subjectName(lesson.subject)} ${t("fällt aus")}` : `${subjectName(lesson.subject)} · ${t(lesson.status === "room_change" ? "Raumänderung" : "Vertretung")}`;
      return { key: `c-${lesson.period}-${lesson.subject?.code}`, icon: RefreshCw, text, aside: `${weekdayShort(focus.date)} · ${lesson.period}.`, danger: cancelled };
    }),
  ];
  return rows;
}

// ─────────────────────────────────────────────────────────────
// После уроков («Für morgen», kind «nachmittag») и вечером / в выходные («Nächster Schultag», kind «abend»).
// Макет 50 handy-02: погода того дня в шапке; задания, уроки с изменениями, тесты
// ─────────────────────────────────────────────────────────────
const FocusAhead = ({ focus, size, editing, changes }) => {
  const t = useT();
  const { today } = useNow();
  const names = usePlanStore((s) => s.meta?.subjects);
  const morgen = focus.kind === "nachmittag";
  const when = focus.date === addDays(today, 1) ? t("Morgen") : weekdayLong(focus.date);
  const title = size === "klein" ? when : morgen ? t("Für morgen") : t("Nächster Schultag");
  const to = `/tag/${focus.date}`;
  const firstLine = focus.first && [subjectName(focus.first.subject), focus.first.room].filter(Boolean).join(" · ");

  if (size === "klein" || size === "breit") {
    const open = focus.homework.length;
    return (
      <BlockCard kind="fuerDich" icon={Sparkle} accent title={title} aside={<WeatherAside day={focus.weatherDay} short={size === "klein"} />} to={to} editing={editing}>
        {size === "breit" && <p className="truncate text-subhead text-ink">{weekdayLong(focus.date)}</p>}
        {size === "klein" && focus.first ? (
          <>
            <p className="text-subhead text-ink">{focus.first.start}</p>
            <p className="truncate text-body-sm text-muted">{firstLine}</p>
          </>
        ) : focus.first ? (
          <p className="truncate text-body-sm text-muted">
            <span className="font-extrabold text-ink">{focus.first.start}</span> · {firstLine}
          </p>
        ) : (
          !focus.loaded && <BlockEmpty text={t("Plan fehlt noch")} />
        )}
        {open > 0 && <p className="mt-auto truncate text-caption font-bold text-accent-ink">{size === "klein" ? t("{n} offen", { n: open }) : `${t("Hausaufgaben")} · ${t("{n} offen", { n: open })}`}</p>}
      </BlockCard>
    );
  }

  const rows = aheadRows(morgen ? { ...focus, homework: [], changes: [] } : focus, { t, names, today });
  return (
    <BlockCard kind="fuerDich" icon={Sparkle} accent title={title} aside={<WeatherAside day={focus.weatherDay} />} to={to} editing={editing}>
      {morgen ? (
        <>
          {focus.homework.length > 0 && (
            <div className="border-b border-hair pb-2">
              <PartTitle aside={t("{n} offen", { n: focus.homework.length })}>{t("Hausaufgaben")}</PartTitle>
              <ul>
                {focus.homework.slice(0, 2).map((row) => (
                  <HomeworkRow key={row.key} row={row} names={names} today={today} />
                ))}
              </ul>
            </div>
          )}
          <div className="pt-1">
            <PartTitle>{weekdayLong(focus.date)}</PartTitle>
            {focus.dayLessons.length ? <LessonList lessons={keyLessons(focus.dayLessons, focus.homework.length ? 2 : 3, changes)} changes={changes} /> : <BlockEmpty text={t("Plan fehlt noch")} />}
          </div>
        </>
      ) : (
        <div className="border-b border-hair pb-2">
          <p className="flex items-baseline gap-2">
            <span className="truncate text-number text-ink lg:text-cell">{weekdayLong(focus.date)}</span>
            <span className="shrink-0 text-body-sm font-bold text-faint">{longDate(focus.date)}</span>
          </p>
          {focus.first ? (
            <p className="truncate text-body-sm text-muted">
              <span className="font-extrabold text-ink">{focus.first.start}</span> · {firstLine}
            </p>
          ) : (
            <p className="text-body-sm text-faint">{t("Plan fehlt noch")}</p>
          )}
        </div>
      )}
      {rows.length > 0 && (
        <ul className="pt-1">
          {rows.slice(0, morgen ? 2 : 4).map(({ key, ...row }) => (
            <InfoRow key={key} {...row} />
          ))}
        </ul>
      )}
    </BlockCard>
  );
};

export default FocusAhead;
