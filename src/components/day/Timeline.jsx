import { useNow } from "../../shared/hooks/useNow";
import { useUserStore } from "../../shared/store/userStore";
import { cn } from "../../shared/utils/cn";
import { subjectName } from "../../shared/utils/format";
import { berlinParts, isLessonPast, toMinutes } from "../../shared/utils/lessonClock";
import { fachClasses, lessonExam, lessonKey } from "../../shared/utils/lessons";
import StatusBadge from "../ui/StatusBadge";
import LessonContextMenu from "../lesson/LessonContextMenu";

const PX_PER_MIN = 1.3; // скільки пікселів висоти на одну хвилину
const AXIS = 48; // ширина колонки з годинами зліва (px)

// ─────────────────────────────────────────────────────────────
// Вигляд «Zeitleiste»: уроки як блоки на шкалі часу.
// Висота блока = тривалість уроку, відступ зверху = час початку.
// Уроки без часу (10) тут не малюються (так і в гайді).
// Паралельні курси стоять поруч.
// ─────────────────────────────────────────────────────────────
const Timeline = ({ day, lessons, onOpen }) => {
  const { now, today } = useNow(); // час школи
  const overrides = useUserStore((s) => s.colorOverrides); // свої кольори

  const items = lessons.filter((l) => l.start).sort((a, b) => toMinutes(a.start) - toMinutes(b.start)); // тільки з часом
  if (items.length === 0) return null; // нічого малювати

  const dayStart = Math.min(...items.map((l) => toMinutes(l.start))); // початок першого уроку (хв)
  const dayEnd = Math.max(...items.map((l) => toMinutes(l.end))); // кінець останнього
  const y = (minutes) => (minutes - dayStart) * PX_PER_MIN; // хвилини → пікселі зверху

  // Цілі години всередині дня (8:00, 9:00 …) для підписів зліва
  const hours = [];
  for (let h = Math.ceil(dayStart / 60); h * 60 <= dayEnd; h++) hours.push(h);

  // Перерви ≥ 10 хв між сусідніми різними часами (для підпису «Pause · 20 min»)
  const times = [...new Set(items.map((l) => `${l.start}-${l.end}`))].map((t) => t.split("-")); // унікальні слоти
  const breaks = times.slice(1).map(([start], i) => ({ from: toMinutes(times[i][1]), to: toMinutes(start) })).filter((b) => b.to - b.from >= 10);

  // Лінія «зараз» — тільки сьогодні і тільки під час уроків
  const { minutes: nowMin, hhmm } = berlinParts(now);
  const showNow = day.date === today && nowMin >= dayStart && nowMin <= dayEnd;

  return (
    <div className="relative" style={{ height: y(dayEnd) + 8 }}>
      {/* підписи годин */}
      {hours.map((h) => (
        <span key={h} className="absolute left-0 -translate-y-1/2 text-right text-small font-bold text-faint" style={{ top: y(h * 60), width: AXIS - 12 }}>
          {h}:00
        </span>
      ))}

      {/* підписи перерв посередині проміжку */}
      {breaks.map((b) => (
        <span key={b.from} className="absolute right-0 -translate-y-1/2 text-center text-micro font-bold text-faint" style={{ top: y((b.from + b.to) / 2), left: AXIS }}>
          Pause · {b.to - b.from} min
        </span>
      ))}

      {/* блоки уроків */}
      {items.map((lesson) => {
        const start = toMinutes(lesson.start);
        const end = toMinutes(lesson.end);
        const siblings = items.filter((l) => l.period === lesson.period); // паралельні курси
        const k = siblings.indexOf(lesson); // який по рахунку
        const isCancelled = lesson.status === "cancelled";

        return (
          <LessonContextMenu key={lessonKey(lesson)} lesson={lesson} date={day.date}>
            <button
              type="button"
              onClick={() => onOpen(lesson)}
              className={cn(
                "absolute flex flex-col justify-between overflow-hidden rounded-2xl px-3 py-2 text-left select-none [-webkit-touch-callout:none]",
                isCancelled ? "border-[1.5px] border-dashed border-faint2 bg-paper text-faint" : fachClasses(lesson.subject.code, overrides),
                !isCancelled && lesson.status !== "normal" && "ring-2 ring-accent ring-inset",
                isLessonPast(lesson, day.date, now) && "opacity-50",
              )}
              // позиція за часом; ширину ділимо між паралельними курсами
              style={{
                top: y(start),
                height: (end - start) * PX_PER_MIN,
                left: `calc(${AXIS}px + (100% - ${AXIS}px) * ${k / siblings.length})`,
                width: `calc((100% - ${AXIS}px) / ${siblings.length} - ${siblings.length > 1 ? 4 : 0}px)`,
              }}
            >
              <div className="flex items-center gap-2">
                <span className={cn("truncate text-body-sm font-extrabold", isCancelled && "line-through")}>{subjectName(lesson.subject)}</span>
                <StatusBadge lesson={lesson} exam={lessonExam(day, lesson)} />
                <span className="ml-auto shrink-0 text-small font-bold opacity-70">
                  {lesson.start}–{lesson.end}
                </span>
              </div>
              <p className="truncate text-caption font-bold opacity-80">{isCancelled ? "fällt aus" : [lesson.teacher, lesson.room].filter(Boolean).join(" · ")}</p>
            </button>
          </LessonContextMenu>
        );
      })}

      {/* лінія «зараз»: час у фіолетовій плашці + лінія */}
      {showNow && (
        <div className="pointer-events-none absolute inset-x-0 z-10 flex -translate-y-1/2 items-center" style={{ top: y(nowMin) }}>
          <span className="rounded-md bg-accent px-1.5 py-0.5 text-micro font-extrabold text-on-accent">{hhmm}</span>
          <span className="size-2 shrink-0 rounded-full bg-accent" />
          <span className="h-0.5 flex-1 bg-accent" />
        </div>
      )}
    </div>
  );
};

export default Timeline;
