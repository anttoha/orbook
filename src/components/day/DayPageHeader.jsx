import { ChevronLeft, ChevronRight, Info } from "lucide-react";
import { usePlanStore } from "../../shared/store/planStore";
import { cn } from "../../shared/utils/cn";
import { longDate, mondayOf, nextSchoolDay, relativeDayWord, weekdayLong } from "../../shared/utils/format";
import ChangedLine from "../week/ChangedLine";
import WeekLetter from "../muster/WeekLetter";
import { abLetter } from "../../shared/utils/muster";
import RoundButton from "../ui/RoundButton";


// ─────────────────────────────────────────────────────────────
// Шапка сторінки дня (телефон):  ‹  «Mittwoch · heute (i)» / «7. Oktober» / «↻ 07:08»   ‹ ›
// date / today — "YYYY-MM-DD".
// day — день (null, поки вантажиться); onInfo — відкрити «Info zum Tag» для будь-якого дня.
// Четверта кругла кнопка не вміщається поруч із довгою датою, тому (i) — малий значок біля дня тижня.
// ─────────────────────────────────────────────────────────────
const DayPageHeader = ({ date, today, day, onInfo }) => {
  const holidays = usePlanStore((s) => s.meta?.holidays); // канікули й свята пропускаємо
  const word = relativeDayWord(date, today); // heute / morgen / gestern
  const prev = nextSchoolDay(date, holidays, -1); // попередній навчальний день
  const next = nextSchoolDay(date, holidays, 1); // наступний навчальний день

  return (
    <header className="flex items-start gap-2.5">
      {/* назад до тижня */}
      <RoundButton to={`/woche?woche=${mondayOf(date)}`} aria-label="Zur Woche" className="mt-1">
        <ChevronLeft className="size-4.25" />
      </RoundButton>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-0.5">
          <p className={cn("truncate text-hint font-extrabold", date === today ? "text-accent-ink" : "text-faint")}>
            {weekdayLong(date)}
            {word && ` · ${word}`}
          </p>
          {/* від'ємні поля: зона натискання 32px, а рядок лишається низьким */}
          {day && (
            <button type="button" aria-label="Info zum Tag" onClick={onInfo} className="-my-2 grid size-8 shrink-0 place-items-center text-muted">
              <Info className="size-3.5" />
            </button>
          )}
        </div>
        {/* «30. September» на вузьких телефонах інакше обрізалось би */}
        <h1 className="truncate text-title text-ink max-[379px]:text-heading max-[339px]:text-number">{longDate(date)}</h1>
        {/* час зміни плану і тиждень циклу школи «WOCHE A» (частина 19): у рядку дня тижня він обрізав би «morgen» */}
        <div className="mt-0.5 flex items-center gap-2">
          <ChangedLine day={day} isToday={false} className="h-3.5 text-small leading-none" iconClassName="size-2.5" />
          <WeekLetter letter={abLetter(day?.week)} />
        </div>
      </div>

      {/* гортати дні (вихідні та канікули пропускаються) */}
      <div className="mt-1 flex shrink-0 gap-1.5">
        <RoundButton to={`/tag/${prev}`} aria-label="Vorheriger Schultag">
          <ChevronLeft className="size-4.25" />
        </RoundButton>
        <RoundButton to={`/tag/${next}`} aria-label="Nächster Schultag">
          <ChevronRight className="size-4.25" />
        </RoundButton>
      </div>
    </header>
  );
};

export default DayPageHeader;
