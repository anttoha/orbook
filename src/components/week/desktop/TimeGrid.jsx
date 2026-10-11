import { Link } from "react-router-dom";
import { useNow } from "../../../shared/hooks/useNow";
import { useLessonFilter } from "../../../shared/hooks/usePlan";
import { useUserStore } from "../../../shared/store/userStore";
import { cn } from "../../../shared/utils/cn";
import { berlinParts, isLessonPast, toMinutes } from "../../../shared/utils/lessonClock";
import { freeText, lessonKey } from "../../../shared/utils/lessons";
import LessonContextMenu from "../../lesson/LessonContextMenu";
import LessonTooltip from "../../lesson/LessonTooltip";
import DesktopLessonCard from "./DesktopLessonCard";
import GridDayHeader from "./GridDayHeader";

const PX_PER_MIN = 1.85; // пікселів на хвилину (на макеті година = 111px)
const LABEL_COL = 50; // ширина колонки з годинами зліва (px)
const CARD_GAP = 3; // відступ картки зверху і знизу всередині свого часу (px)

// ─────────────────────────────────────────────────────────────
// Вигляд тижня «Zeitraster» (макет «Woche · Zeitraster + Seitenspalte»):
// дні — колонки, уроки стоять за часом (висота = тривалість),
// зліва години, горизонтальні лінії на кожну годину, лінія «зараз».
// Паралельні курси (однаковий урок) стоять поруч, ділячи ширину колонки.
// Уроки без часу (10 — AG після занять) — окремим рядком під сіткою.
// days — дні тижня; onLessonClick(day, lesson) — клік по уроку
// ─────────────────────────────────────────────────────────────
const TimeGrid = ({ days, onLessonClick }) => {
  const { now, today } = useNow(); // час школи
  const filter = useLessonFilter(); // «Meine Kurse»
  const overrides = useUserStore((s) => s.colorOverrides); // свої кольори

  const shown = days.map((day) => ({ ...day, lessons: filter(day.lessons) })); // без прихованих курсів
  const todayIndex = days.findIndex((d) => d.date === today); // колонка «сьогодні» (-1 — не цей тиждень)
  const timed = shown.flatMap((d) => d.lessons.filter((l) => l.start)); // уроки з часом

  // Межі сітки: від найранішого початку до найпізнішого кінця (порожній тиждень — 07:30–13:10)
  const dayStart = timed.length ? Math.min(...timed.map((l) => toMinutes(l.start))) : 450;
  const dayEnd = timed.length ? Math.max(...timed.map((l) => toMinutes(l.end))) : 790;
  const y = (minutes) => (minutes - dayStart) * PX_PER_MIN; // хвилини → пікселі зверху
  const height = y(dayEnd) + 12; // висота області з уроками (+ запас знизу)

  // Цілі години для ліній і підписів (8:00 … 15:00)
  const hours = [];
  for (let h = Math.ceil(dayStart / 60); h * 60 <= dayEnd; h++) hours.push(h);

  // Лінія «зараз»: тільки на тижні з сьогоднішнім днем і під час уроків
  const nowMin = berlinParts(now).minutes;
  const showNow = todayIndex >= 0 && nowMin >= dayStart && nowMin <= dayEnd;
  const hasUntimed = shown.some((d) => d.lessons.some((l) => !l.start)); // є уроки без часу

  // Однакові колонки для всіх шарів (години + дні), між днями 10px
  const columns = { gridTemplateColumns: `${LABEL_COL}px repeat(${days.length}, minmax(0, 1fr))`, columnGap: 10 };

  // Одна картка уроку з меню (ПКМ), підказкою (наведення) і кліком (панель уроку)
  const card = (day, lesson, className, style) => (
    <LessonContextMenu key={lessonKey(lesson)} lesson={lesson} date={day.date}>
      <LessonTooltip lesson={lesson}>
        <DesktopLessonCard lesson={lesson} overrides={overrides} isPast={isLessonPast(lesson, day.date, now)} onClick={() => onLessonClick(day, lesson)} className={className} style={style} />
      </LessonTooltip>
    </LessonContextMenu>
  );

  return (
    <div className="grid" style={{ ...columns, rowGap: 10 }}>
      {/* ── шапка: дні тижня (посилання на сторінку дня) ── */}
      {shown.map((day, di) => (
        <GridDayHeader key={day.date} as={Link} to={`/tag/${day.date}`} day={day} isToday={di === todayIndex} style={{ gridRow: 1, gridColumn: di + 2 }} />
      ))}

      {/* ── шар 1: підписи годин і горизонтальні лінії (на всю ширину) ── */}
      <div className="pointer-events-none relative" style={{ gridRow: 2, gridColumn: "1 / -1", height }}>
        {hours.map((h) => (
          <div key={h} className="absolute inset-x-0" style={{ top: y(h * 60) }}>
            <span className="absolute -translate-y-1/2 pr-2.5 text-right text-small font-semibold text-faint" style={{ width: LABEL_COL }}>
              {h}:00
            </span>
            <span className="absolute right-0 h-px bg-rule" style={{ left: LABEL_COL }} />
          </div>
        ))}
      </div>

      {/* ── шар 2: колонки днів з уроками ── */}
      {shown.map((day, di) => {
        const free = freeText(day); // день без плану?
        return (
          <div
            key={day.date}
            // сьогоднішня колонка — пісочний фон під уроками (як на макеті)
            className={cn("relative rounded-2xl", di === todayIndex && "bg-sand/70", free && "grid place-items-center border-[1.5px] border-dashed border-rule")}
            style={{ gridRow: 2, gridColumn: di + 2, height }}
          >
            {free && <span className="text-label font-bold text-faint">{free}</span>}
            {day.lessons
              .filter((l) => l.start)
              .map((lesson) => {
                const siblings = day.lessons.filter((l) => l.period === lesson.period); // паралельні курси
                const k = siblings.indexOf(lesson); // який по рахунку
                const start = toMinutes(lesson.start);
                const end = toMinutes(lesson.end);
                return card(day, lesson, "absolute", {
                  // позиція за часом: зверху — початок уроку, висота — тривалість
                  top: y(start) + CARD_GAP,
                  height: (end - start) * PX_PER_MIN - CARD_GAP * 2,
                  // ширину колонки ділимо між паралельними курсами
                  left: `calc(${(k / siblings.length) * 100}% + 3px)`,
                  width: `calc(${100 / siblings.length}% - 6px)`,
                });
              })}
          </div>
        );
      })}

      {/* ── шар 3: лінія «зараз» ── */}
      {showNow && (
        <div className="pointer-events-none relative z-10" style={{ gridRow: 2, gridColumn: "1 / -1", height }}>
          <div className="absolute inset-x-0" style={{ top: y(nowMin) }}>
            {/* час у фіолетовій плашці зліва */}
            <span className="absolute left-0 -translate-y-1/2 rounded-md bg-accent px-1.75 py-0.5 text-small font-extrabold text-on-accent">{berlinParts(now).hhmm}</span>
            {/* тонка лінія через усі дні */}
            <span className="absolute right-0 h-px -translate-y-1/2 bg-accent/60" style={{ left: LABEL_COL }} />
            {/* товстий відрізок + кружечок у колонці сьогоднішнього дня (та сама сітка колонок) */}
            <div className="absolute inset-x-0 grid" style={columns}>
              <div className="relative" style={{ gridColumn: todayIndex + 2 }}>
                <span className="absolute inset-x-0 h-[3px] -translate-y-1/2 rounded-full bg-accent" />
                <span className="absolute -left-1.25 size-2.5 -translate-y-1/2 rounded-full bg-accent" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── уроки без часу (10. Stunde) — під сіткою ── */}
      {hasUntimed && (
        <>
          <span className="self-center pr-2.5 text-right text-small font-semibold text-faint" style={{ gridRow: 3, gridColumn: 1 }}>
            AG
          </span>
          {shown.map((day, di) => (
            <div key={day.date} className="flex flex-col gap-1.5" style={{ gridRow: 3, gridColumn: di + 2 }}>
              {day.lessons.filter((l) => !l.start).map((lesson) => card(day, lesson, "h-16"))}
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default TimeGrid;
