import { Link } from "react-router-dom";
import ChangedLine from "./ChangedLine";
import { cn } from "../../shared/utils/cn";
import { dayNumber, longDate, weekdayLong } from "../../shared/utils/format";

// Шапка дня в сітці тижня («MI 17» і час зміни плану). День із Muster — заштрихований. Це посилання на сторінку дня (/tag/2026-10-07)
const DayHeader = ({ day, isToday, style }) => {
  return (
    <Link
      to={`/tag/${day.date}`}
      style={style}
      aria-label={`${weekdayLong(day.date)}, ${longDate(day.date)}`}
      className={cn("relative flex h-13 flex-col items-center justify-center rounded-cell transition-colors", isToday ? "bg-accent text-on-accent" : "text-ink hover:bg-sand", day.muster && !isToday && "hatch-line")}
    >
      <span className={cn("text-micro font-bold uppercase", isToday ? "text-today-sub" : "text-faint")}>{day.weekday}</span>
      <span className="text-cell-sm">{dayNumber(day.date)}</span>
      <ChangedLine day={day} isToday={isToday} className="h-2.5 max-w-full px-0.5 text-nano leading-none" />

      {/* крапка: сьогодні — світла, у дня є Klausur — фіолетова */}
      {isToday && <span className="absolute top-1.25 right-1.75 size-1.5 rounded-full bg-today-sub" />}
      {!isToday && day.exams.length > 0 && <span className="absolute top-1.25 right-1.75 size-1.5 rounded-full bg-accent" />}
    </Link>
  );
};

export default DayHeader;
