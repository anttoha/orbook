import { Fragment } from "react";
import { useNow } from "../../shared/hooks/useNow";
import { useUserStore } from "../../shared/store/userStore";
import { berlinParts, isLessonNow, isLessonPast, toMinutes } from "../../shared/utils/lessonClock";
import { lessonExam, lessonKey } from "../../shared/utils/lessons";
import { findNote } from "../../shared/utils/notes";
import BreakRow from "./BreakRow";
import LessonRow from "./LessonRow";

// Перерви, коротші за це, не показуємо (5-хвилинні між уроками)
const MIN_BREAK = 10;

// ─────────────────────────────────────────────────────────────
// Вигляд «Liste»: уроки дня згори вниз + перерви між ними.
// day — день із сервера (для Klausuren), lessons — уроки після фільтра «Meine Kurse»
// onOpen(lesson) — клік по уроку
// preliminary — це «очікувані» уроки (план ще не вийшов): показуємо блідо, без меню
// ─────────────────────────────────────────────────────────────
const LessonList = ({ day, lessons, onOpen, preliminary = false }) => {
  const { now } = useNow(); // час школи
  const overrides = useUserStore((s) => s.colorOverrides); // свої кольори
  const notes = useUserStore((s) => s.notes); // усі нотатки (фільтруємо нижче)
  const minutes = berlinParts(now).minutes; // зараз у хвилинах

  // Спершу уроки з часом (за часом), уроки без часу (10) — у кінець
  const sorted = [...lessons].sort((a, b) => (a.start ? toMinutes(a.start) : 9999) - (b.start ? toMinutes(b.start) : 9999) || a.period - b.period);

  return (
    <div className="flex flex-col gap-2">
      {sorted.map((lesson, k) => {
        const prev = sorted[k - 1]; // попередній урок
        // Перерва перед уроком: початок цього − кінець попереднього
        const gap = prev?.end && lesson.start ? toMinutes(lesson.start) - toMinutes(prev.end) : 0;
        // Урок іде зараз → скільки лишилось (для бейджа «LÄUFT · 27 MIN»)
        const live = isLessonNow(lesson, day.date, now) ? { minutesLeft: toMinutes(lesson.end) - minutes } : null;

        return (
          <Fragment key={lessonKey(lesson)}>
            {gap >= MIN_BREAK && <BreakRow minutes={gap} />}
            <LessonRow
              lesson={lesson}
              exam={lessonExam(day, lesson)}
              date={day.date}
              isPast={preliminary || isLessonPast(lesson, day.date, now)}
              live={live}
              note={findNote(notes, `${day.date}#${lesson.period}`)} // нотатка до цього уроку
              overrides={overrides}
              onOpen={preliminary ? undefined : () => onOpen(lesson)}
            />
          </Fragment>
        );
      })}
    </div>
  );
};

export default LessonList;
