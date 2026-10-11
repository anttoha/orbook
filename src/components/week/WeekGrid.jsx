import { useNow } from "../../shared/hooks/useNow";
import { useLessonFilter } from "../../shared/hooks/usePlan";
import { useUserStore } from "../../shared/store/userStore";
import { berlinParts, isLessonPast, toMinutes } from "../../shared/utils/lessonClock";
import { freeText, lessonKey, periodRows } from "../../shared/utils/lessons";
import { usePlanStore } from "../../shared/store/planStore";
import LessonContextMenu from "../lesson/LessonContextMenu";
import DayHeader from "./DayHeader";
import LessonCell from "./LessonCell";
import NowLine from "./NowLine";

// Де зараз лінія часу: { index — рядок, progress — 0…1 } або null (до/після уроків)
const nowPosition = (rows, minutes) => {
  for (let i = 0; i < rows.length; i++) {
    if (!rows[i].start) continue; // урок 10 без часу
    const start = toMinutes(rows[i].start);
    const end = toMinutes(rows[i].end);
    if (minutes < start) return i === 0 ? null : { index: i, progress: 0 }; // перерва перед уроком
    if (minutes <= end) return { index: i, progress: (minutes - start) / (end - start) };
  }
  return null;
};

// ─────────────────────────────────────────────────────────────
// Сітка тижня (телефон): рядки — номери уроків, колонки — дні.
// days — дні тижня з сервера (week.days, + Sa/So), onLessonClick(day, lesson) — клік по уроку
// ─────────────────────────────────────────────────────────────
const WeekGrid = ({ days, onLessonClick }) => {
  const { now, today } = useNow(); // час школи
  const filter = useLessonFilter(); // «Meine Kurse»
  const overrides = useUserStore((s) => s.colorOverrides); // свої кольори
  const lessonTimes = usePlanStore((s) => s.meta?.lessonTimes); // час уроків

  const shown = days.map((day) => ({ ...day, lessons: filter(day.lessons) })); // дні без прихованих курсів
  const rows = periodRows(shown, lessonTimes); // рядки: уроки, що є в цьому тижні
  const dayCount = days.length;
  const todayIndex = days.findIndex((d) => d.date === today); // колонка сьогодні (-1 — не цей тиждень)
  const nowPos = todayIndex >= 0 ? nowPosition(rows, berlinParts(now).minutes) : null;

  return (
    <div className="grid gap-1" style={{ gridTemplateColumns: `32px repeat(${dayCount}, minmax(0, 1fr))` }}>
      {/* ── шапка з днями ── */}
      {days.map((day, di) => (
        <DayHeader key={day.date} style={{ gridRow: 1, gridColumn: di + 2 }} day={day} isToday={di === todayIndex} />
      ))}

      {/* ── номери уроків зліва (у уроку 10 часу немає) ── */}
      {rows.map((row, ri) => (
        <div key={row.period} style={{ gridRow: ri + 2, gridColumn: 1 }} className="flex flex-col items-center justify-center gap-px">
          <span className="text-body leading-none font-extrabold text-ink">{row.period}</span>
          {row.start && <span className="text-tiny leading-none font-medium text-faint">{row.start}</span>}
        </div>
      ))}

      {/* ── уроки ── */}
      {shown.map((day, di) => {
        // День без плану (вихідний, свято, план ще не вийшов) — одна клітинка на всю висоту
        const free = freeText(day);
        if (free) {
          return (
            <div
              key={day.date}
              style={{ gridRow: `2 / span ${Math.max(rows.length, 1)}`, gridColumn: di + 2 }}
              className="grid min-h-16 place-items-center rounded-[14px] bg-sand/60 text-tiny font-extrabold text-faint [writing-mode:vertical-rl]"
            >
              {free}
            </div>
          );
        }

        return rows.map((row, ri) => {
          const lessons = day.lessons.filter((l) => l.period === row.period); // уроки в цій клітинці (паралельні — кілька)
          const style = { gridRow: ri + 2, gridColumn: di + 2 }; // місце в сітці
          if (lessons.length === 0) return <div key={`${day.date}-${row.period}`} style={style} className="min-h-12 rounded-[14px] bg-sand/60" />;

          return (
            // кілька паралельних курсів — стовпчиком в одній клітинці
            <div key={`${day.date}-${row.period}`} style={style} className="flex min-h-12 flex-col gap-0.5">
              {lessons.map((lesson) => (
                <LessonContextMenu key={lessonKey(lesson)} lesson={lesson} date={day.date}>
                  <LessonCell lesson={lesson} isPast={isLessonPast(lesson, day.date, now)} overrides={overrides} onClick={() => onLessonClick(day, lesson)} />
                </LessonContextMenu>
              ))}
            </div>
          );
        });
      })}

      {/* ── лінія «зараз» ── */}
      {nowPos && <NowLine row={nowPos.index + 2} progress={nowPos.progress} todayIndex={todayIndex} dayCount={dayCount} />}
    </div>
  );
};

export default WeekGrid;
