import { useNow } from "../../shared/hooks/useNow";
import { subjectName } from "../../shared/utils/format";
import { afterText, lessonProgress } from "../../shared/utils/lessonClock";

// ─────────────────────────────────────────────────────────────
// Фіолетова картка «Jetzt · Physik · 301 · noch 27 min».
// live — результат lessonState() з lessonClock.js:
//   live.current — урок іде → «Jetzt», смужка прогресу, «Danach 20 min Pause · …»
//   інакше live.next — перерва або ранок → «Gleich · … · in 15 min»
// onOpen(lesson) — відкрити шторку уроку
// ─────────────────────────────────────────────────────────────
const CurrentLessonCard = ({ live, onOpen }) => {
  const { now } = useNow(); // час школи (для смужки прогресу)
  const isRunning = Boolean(live.current); // урок іде?
  const lesson = live.current ?? live.next; // про який урок картка

  // Нижній рядок
  const footer = isRunning ? afterText(live.current, live.next, subjectName) : `Beginn ${lesson.start} · bis ${lesson.end}`;

  return (
    <button type="button" onClick={() => onOpen(lesson)} className="flex flex-col gap-2.5 rounded-[22px] bg-accent p-4 text-left text-on-accent">
      {/* верхній рядок */}
      <div className="flex items-baseline gap-2">
        <span className="text-caption font-extrabold opacity-75">{isRunning ? "Jetzt" : "Gleich"}</span>
        <span className="min-w-0 flex-1 truncate text-subhead font-black">
          {subjectName(lesson.subject)}
          {lesson.room && ` · ${lesson.room}`}
        </span>
        <span className="shrink-0 text-label font-extrabold opacity-90">{isRunning ? `noch ${live.minutesLeft} min` : `in ${live.breakMinutes} min`}</span>
      </div>

      {/* смужка прогресу уроку (тільки коли урок іде) */}
      {isRunning && (
        <div className="h-1.5 overflow-hidden rounded-full bg-on-accent/25">
          <div className="h-full rounded-full bg-on-accent" style={{ width: `${lessonProgress(lesson, now) * 100}%` }} />
        </div>
      )}

      <p className="text-caption font-bold opacity-80">{footer}</p>
    </button>
  );
};

export default CurrentLessonCard;
