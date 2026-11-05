import { Link } from "react-router-dom";
import { cn } from "../../shared/utils/cn";
import { changedText, dayNumber, longDate, weekdayLong } from "../../shared/utils/format";

// Шапка дня в сітці тижня («MI 17»). Це посилання на сторінку дня (/tag/2026-10-07)
const DayHeader = ({ day, isToday, style }) => {
  const changed = changedText(day);

  return (
    <div style={style}>
      <Link
        to={`/tag/${day.date}`}
        aria-label={`${weekdayLong(day.date)}, ${longDate(day.date)}`}
        className={cn("relative flex h-10.5 flex-col items-center justify-center rounded-cell transition-colors", isToday ? "bg-accent text-on-accent" : "text-ink hover:bg-sand")}
      >
        <span className={cn("text-micro font-bold uppercase", isToday ? "text-today-sub" : "text-faint")}>{day.weekday}</span>
        <span className="text-cell-sm">{dayNumber(day.date)}</span>
  
        {/* крапка: сьогодні — світла, у дня є Klausur — фіолетова */}
        {isToday && <span className="absolute top-1.25 right-1.75 size-1.5 rounded-full bg-today-sub" />}
        {!isToday && day.exams.length > 0 && <span className="absolute top-1.25 right-1.75 size-1.5 rounded-full bg-accent" />}
      </Link>
      {/* вузька колонка: текст переноситься на два рядки */}
      {changed && <p className="mt-0.5 text-center text-nano leading-tight text-faint">{changed}</p>}
    </div>
  );
};

export default DayHeader;
