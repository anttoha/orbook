import { useNow } from "../../shared/hooks/useNow";
import { useUserStore } from "../../shared/store/userStore";
import { cn } from "../../shared/utils/cn";
import { subjectName } from "../../shared/utils/format";
import { berlinParts, isLessonNow, isLessonPast, toMinutes } from "../../shared/utils/lessonClock";
import { fachClasses, lessonExam, lessonKey } from "../../shared/utils/lessons";
import StatusBadge from "../ui/StatusBadge";
import LessonContextMenu from "../lesson/LessonContextMenu";

const PX_PER_MIN = 1.28; // шкала: скільки пікселів висоти на одну хвилину
const BLOCK_PX_PER_MIN = 1.2; // блок трохи нижчий за свій час: так між уроками є зазор, як на макеті
const AXIS = 50; // ширина колонки з годинами зліва (px)
const BLOCK_PADDING = 12; // внутрішній відступ блока: на цьому рівні стоїть і підпис перерви

// ─────────────────────────────────────────────────────────────
// Вигляд «Zeitleiste»: уроки як блоки на шкалі часу.
// Висота блока = тривалість уроку, відступ зверху = час початку.
// Уроки без часу (10) тут не малюються (так і в гайді).
// Паралельні курси стоять поруч.
// ─────────────────────────────────────────────────────────────
const Timeline = ({ day, lessons, onOpen }) => {
  const { now, today } = useNow(); // час школи
  const overrides = useUserStore((s) => s.colorOverrides); // свої кольори

  const items = lessons.filter((l) => l.start && l.end).sort((a, b) => toMinutes(a.start) - toMinutes(b.start)); // тільки з часом
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
    <div className="relative mt-1.5" style={{ height: y(dayEnd) + 14 }}>
      {/* години: підпис зліва і тонка лінія через усю шкалу */}
      {hours.map((h) => (
        <div key={h} className="absolute inset-x-0" style={{ top: y(h * 60) }}>
          <span className="absolute left-0 -translate-y-1/2 text-right text-axis text-faint" style={{ width: AXIS - 12 }}>
            {h}:00
          </span>
          <span className="absolute right-0 h-px bg-hair" style={{ left: AXIS - 2 }} />
        </div>
      ))}

      {/* підписи перерв посередині проміжку */}
      {breaks.map((b) => (
        <span key={b.from} className="absolute -translate-y-1/2 text-tiny font-extrabold text-faint2" style={{ top: y((b.from + b.to) / 2), left: AXIS + BLOCK_PADDING }}>
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
        const isHighlighted = !isCancelled && (lesson.status !== "normal" || isLessonNow(lesson, day.date, now)); // зміна або урок, що йде

        return (
          <LessonContextMenu key={lessonKey(lesson)} lesson={lesson} date={day.date}>
            <button
              type="button"
              onClick={() => onOpen(lesson)}
              className={cn(
                "absolute flex flex-col justify-center gap-0.5 overflow-hidden text-left select-none [-webkit-touch-callout:none]",
                isCancelled ? "rounded-cell border border-dashed border-faint2 text-faint" : cn("rounded-block", fachClasses(lesson.subject?.code, overrides)),
                isHighlighted && "ring-2 ring-accent",
                isLessonPast(lesson, day.date, now) && "opacity-50",
              )}
              // позиція за часом; ширину ділимо між паралельними курсами
              style={{
                top: y(start),
                height: (end - start) * BLOCK_PX_PER_MIN,
                paddingInline: BLOCK_PADDING,
                left: `calc(${AXIS}px + (100% - ${AXIS}px) * ${k / siblings.length})`,
                width: `calc((100% - ${AXIS}px) / ${siblings.length} - ${siblings.length > 1 ? 4 : 0}px)`,
              }}
            >
              <div className="flex items-center gap-2">
                <span className={cn("truncate text-body-sm font-black", isCancelled && "line-through")}>{subjectName(lesson.subject)}</span>
                {/* у відміненого бейдж не потрібен: нижче написано «fällt aus» */}
                {!isCancelled && <StatusBadge lesson={lesson} exam={lessonExam(day, lesson)} />}
                <span className="ml-auto shrink-0 text-small text-faint">
                  {lesson.start}–{lesson.end}
                </span>
              </div>
              <p className="truncate text-caption text-muted">{isCancelled ? "fällt aus" : [lesson.teacher, lesson.room].filter(Boolean).join(" · ")}</p>
            </button>
          </LessonContextMenu>
        );
      })}

      {/* лінія «зараз»: час у фіолетовій плашці, крапка і лінія трохи за край блоків (як на макеті) */}
      {showNow && (
        <div className="pointer-events-none absolute left-0 -right-1.5 z-10 flex -translate-y-1/2 items-center gap-0.5" style={{ top: y(nowMin) }}>
          <span className="grid h-4.5 w-10.5 shrink-0 place-items-center rounded-tag bg-accent text-micro font-bold text-paper">{hhmm}</span>
          <span className="size-2.25 shrink-0 rounded-full bg-accent" />
          <span className="-ml-0.5 h-0.5 flex-1 bg-accent" />
        </div>
      )}
    </div>
  );
};

export default Timeline;
