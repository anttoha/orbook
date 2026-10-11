import { Link } from "react-router-dom";
import { cn } from "../../shared/utils/cn";
import { dayNumber, longDate, weekdayLong } from "../../shared/utils/format";

// Шапка дня в сітці тижня («MI 17»). Це посилання на сторінку дня (/tag/2026-10-07)
const DayHeader = ({ day, isToday, style }) => {
  return (
    <Link
      to={`/tag/${day.date}`}
      style={style}
      aria-label={`${weekdayLong(day.date)}, ${longDate(day.date)}`}
      className={cn("relative flex flex-col items-center rounded-2xl py-1 transition-colors", isToday ? "bg-accent text-on-accent" : "text-ink hover:bg-sand")}
    >
      <span className={cn("mb-px text-caption leading-4 font-extrabold uppercase", isToday ? "text-today-sub" : "text-faint")}>{day.weekday}</span>
      <span className="text-number leading-6 font-black">{dayNumber(day.date)}</span>

      {/* крапка: сьогодні — світла, у дня є Klausur — фіолетова */}
      {isToday && <span className="absolute top-1.25 right-1.75 size-1.5 rounded-full bg-today-sub" />}
      {!isToday && day.exams.length > 0 && <span className="absolute top-1.25 right-1.75 size-1.5 rounded-full bg-accent" />}
    </Link>
  );
};

export default DayHeader;
