import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePlanStore } from "../../shared/store/planStore";
import { longDate, mondayOf, nextSchoolDay, relativeDayWord, weekdayLong } from "../../shared/utils/format";

// Кругла кнопка-посилання
const roundLink = "grid size-9.5 shrink-0 place-items-center rounded-full bg-card text-ink";

// ─────────────────────────────────────────────────────────────
// Шапка сторінки дня (телефон):  ‹  «Mittwoch · heute» / «7. Oktober»   ‹ ›
// date / today — "YYYY-MM-DD"; search — хвіст адреси (?ansicht=zeitleiste),
// щоб при гортанні днів вигляд зберігався
// ─────────────────────────────────────────────────────────────
const DayPageHeader = ({ date, today, search = "" }) => {
  const holidays = usePlanStore((s) => s.meta?.holidays); // канікули й свята пропускаємо
  const word = relativeDayWord(date, today); // heute / morgen / gestern
  const prev = nextSchoolDay(date, holidays, -1); // попередній навчальний день
  const next = nextSchoolDay(date, holidays, 1); // наступний навчальний день

  return (
    <header className="flex items-center gap-2">
      {/* назад до тижня (просто стрілка, без кола — як на макеті) */}
      <Link to={`/woche?woche=${mondayOf(date)}`} aria-label="Zur Woche" className="-ml-1.5 grid size-7 shrink-0 place-items-center text-ink">
        <ChevronLeft className="size-5.5" strokeWidth={2.5} />
      </Link>

      <div className="min-w-0 flex-1">
        <p className="text-label leading-4 font-extrabold text-accent">
          {weekdayLong(date)}
          {word && ` · ${word}`}
        </p>
        <h1 className="truncate text-[27px] leading-[1.1] font-black text-ink">{longDate(date)}</h1>
      </div>

      {/* гортати дні (вихідні та канікули пропускаються) */}
      <Link to={`/tag/${prev}${search}`} aria-label="Vorheriger Schultag" className={roundLink}>
        <ChevronLeft className="size-4.5" />
      </Link>
      <Link to={`/tag/${next}${search}`} aria-label="Nächster Schultag" className={roundLink}>
        <ChevronRight className="size-4.5" />
      </Link>
    </header>
  );
};

export default DayPageHeader;
