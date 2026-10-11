import { useNow } from "../../../shared/hooks/useNow";
import { useLessonFilter } from "../../../shared/hooks/usePlan";
import { usePlanStore } from "../../../shared/store/planStore";
import { useUserStore } from "../../../shared/store/userStore";
import { isLessonPast } from "../../../shared/utils/lessonClock";
import { freeText, lessonKey, periodRows } from "../../../shared/utils/lessons";
import LessonContextMenu from "../../lesson/LessonContextMenu";
import LessonTooltip from "../../lesson/LessonTooltip";
import DesktopLessonCard from "./DesktopLessonCard";
import GridDayHeader from "./GridDayHeader";

// ─────────────────────────────────────────────────────────────
// Вигляд тижня «Stunden + Tag» (макет «Woche · Stunden + gewählter Tag»):
// рядки — номери уроків, колонки — дні. Вибраний день обведено фіолетовим,
// його уроки показано праворуч у DayPanel.
// days — дні тижня; selectedDay — "2026-10-07"; onSelectDay(iso); onLessonClick(day, lesson)
// ─────────────────────────────────────────────────────────────
const PeriodGrid = ({ days, selectedDay, onSelectDay, onLessonClick }) => {
  const { now, today } = useNow(); // час школи
  const filter = useLessonFilter(); // «Meine Kurse»
  const overrides = useUserStore((s) => s.colorOverrides); // свої кольори
  const lessonTimes = usePlanStore((s) => s.meta?.lessonTimes); // час уроків

  const shown = days.map((day) => ({ ...day, lessons: filter(day.lessons) })); // без прихованих курсів
  const rows = periodRows(shown, lessonTimes); // номери уроків цього тижня
  const selectedIndex = days.findIndex((d) => d.date === selectedDay); // колонка вибраного дня

  return (
    <div
      className="grid gap-x-2.5 gap-y-3"
      // 64px під номер уроку + рівні колонки днів; рядки: шапка + уроки мінімум по 104px
      style={{ gridTemplateColumns: `64px repeat(${days.length}, minmax(0, 1fr))`, gridTemplateRows: `auto repeat(${rows.length}, minmax(104px, auto))` }}
    >
      {/* рамка + фон вибраного дня (під уроками, на всю висоту колонки) */}
      {selectedIndex >= 0 && (
        <div aria-hidden className="pointer-events-none -m-1.25 rounded-[20px] bg-sand/60 ring-2 ring-accent" style={{ gridRow: "1 / -1", gridColumn: selectedIndex + 2 }} />
      )}

      {/* ── шапка: дні (клік вибирає день) ── */}
      {shown.map((day, di) => (
        <GridDayHeader
          key={day.date}
          day={day}
          isToday={day.date === today}
          type="button"
          aria-pressed={di === selectedIndex} // чи вибраний день
          onClick={() => onSelectDay(day.date)}
          className="relative"
          style={{ gridRow: 1, gridColumn: di + 2 }}
        />
      ))}

      {/* ── номери уроків зліва: «1 / 07:30 / 08:15» ── */}
      {rows.map((row, ri) => (
        <div key={row.period} className="flex flex-col justify-center pl-1" style={{ gridRow: ri + 2, gridColumn: 1 }}>
          <span className="text-logo leading-none font-black text-ink">{row.period}</span>
          {row.start && <span className="mt-1 text-small font-semibold text-faint">{row.start}</span>}
          {row.end && <span className="text-small font-semibold text-faint">{row.end}</span>}
        </div>
      ))}

      {/* ── уроки ── */}
      {shown.map((day, di) => {
        // День без плану — одна пунктирна клітинка на всю висоту
        const free = freeText(day);
        if (free) {
          return (
            <div
              key={day.date}
              style={{ gridRow: `2 / span ${Math.max(rows.length, 1)}`, gridColumn: di + 2 }}
              className="relative grid min-h-26 place-items-center rounded-[14px] border-[1.5px] border-dashed border-rule text-label font-bold text-faint"
            >
              {free}
            </div>
          );
        }

        return rows.map((row, ri) => {
          const lessons = day.lessons.filter((l) => l.period === row.period); // уроки клітинки
          const place = { gridRow: ri + 2, gridColumn: di + 2 }; // місце в сітці

          // Вільний урок — пунктирна клітинка «frei»
          if (lessons.length === 0) {
            return (
              <div key={`${day.date}-${row.period}`} style={place} className="relative grid place-items-center rounded-[14px] border-[1.5px] border-dashed border-rule text-caption font-semibold text-faint">
                frei
              </div>
            );
          }

          return (
            // паралельні курси — стовпчиком
            <div key={`${day.date}-${row.period}`} style={place} className="relative flex flex-col gap-1.5">
              {lessons.map((lesson) => (
                <LessonContextMenu key={lessonKey(lesson)} lesson={lesson} date={day.date}>
                  <LessonTooltip lesson={lesson}>
                    <DesktopLessonCard lesson={lesson} overrides={overrides} isPast={isLessonPast(lesson, day.date, now)} onClick={() => onLessonClick(day, lesson)} className="flex-1" />
                  </LessonTooltip>
                </LessonContextMenu>
              ))}
            </div>
          );
        });
      })}
    </div>
  );
};

export default PeriodGrid;
