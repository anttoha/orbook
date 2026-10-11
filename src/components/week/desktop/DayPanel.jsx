import { useState } from "react";
import { Link } from "react-router-dom";
import { ChartNoAxesGantt, List } from "lucide-react";
import { useNow } from "../../../shared/hooks/useNow";
import { useDay, useLessonFilter } from "../../../shared/hooks/usePlan";
import { useSheet } from "../../../shared/hooks/useSheet";
import { longDate, relativeDayWord, weekdayLong } from "../../../shared/utils/format";
import { freeText } from "../../../shared/utils/lessons";
import DayInfoBanner from "../../day/DayInfoBanner";
import LessonList from "../../day/LessonList";
import Timeline from "../../day/Timeline";
import Segmented from "../../ui/Segmented";

// Перемикач «Liste / Zeitleiste» (тільки іконки, як на макеті)
const VIEWS = [
  { value: "liste", label: "Liste", icon: List },
  { value: "zeitleiste", label: "Zeitleiste", icon: ChartNoAxesGantt },
];

// ─────────────────────────────────────────────────────────────
// Права картка вигляду «Stunden + Tag»: уроки вибраного дня.
// Заголовок — посилання на повну сторінку дня. date — "2026-10-07"
// ─────────────────────────────────────────────────────────────
const DayPanel = ({ date }) => {
  const { today } = useNow(); // сьогодні
  const { openSheet } = useSheet(); // відкрити шторку
  const filter = useLessonFilter(); // «Meine Kurse»
  const { day } = useDay(date); // день із уже завантаженого тижня
  const [view, setView] = useState("liste"); // вигляд усередині картки

  const lessons = day ? filter(day.lessons) : []; // уроки дня
  const word = relativeDayWord(date, today); // heute / morgen / gestern
  const openLesson = (lesson) => openSheet("stunde", { datum: date, stunde: lesson.period, fach: lesson.subject.code });

  return (
    <section className="flex flex-col gap-3.5 rounded-[24px] bg-card p-4.5">
      <header className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="text-label font-extrabold text-accent">
            {weekdayLong(date)}
            {word && ` · ${word}`}
          </p>
          {/* посилання на сторінку дня */}
          <Link to={`/tag/${date}`} className="block truncate text-[28px] leading-tight font-black text-ink hover:underline">
            {longDate(date)}
          </Link>
        </div>
        {lessons.length > 0 && <Segmented label="Ansicht" options={VIEWS} value={view} onChange={setView} variant="accent" size="sm" iconOnly className="shrink-0" />}
      </header>

      {day?.info.length > 0 && <DayInfoBanner info={day.info} onClick={() => openSheet("info", { datum: date })} />}

      {day && lessons.length === 0 && <p className="py-10 text-center text-body font-bold text-faint">{freeText(day) ?? "Kein Unterricht"}</p>}
      {day && lessons.length > 0 && view === "liste" && <LessonList day={day} lessons={lessons} onOpen={openLesson} variant="inline" />}
      {day && lessons.length > 0 && view === "zeitleiste" && <Timeline day={day} lessons={lessons} onOpen={openLesson} />}
    </section>
  );
};

export default DayPanel;
