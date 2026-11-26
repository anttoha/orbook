import { Link } from "react-router-dom";
import ChangedLine from "./ChangedLine";
import WeatherMini from "../weather/WeatherMini";
import { useWeather } from "../../shared/hooks/useWeather";
import { cn } from "../../shared/utils/cn";
import { dayNumber, longDate, weekdayLong } from "../../shared/utils/format";
import { translate } from "../../shared/i18n/translate";

// Шапка дня в сітці тижня («MI 17» і час зміни плану). День із Muster — заштрихований. Це посилання на сторінку дня (/tag/2026-10-07)
// Часть 50a: есть погода у школы — третья строка «☀ 21°» (плашка выше, у всех дней одинаково)
const DayHeader = ({ day, isToday, style }) => {
  const hasWeather = Boolean(useWeather().weather);
  return (
    <Link
      to={`/tag/${day.date}`}
      style={style}
      aria-label={`${weekdayLong(day.date)}, ${longDate(day.date)}`}
      className={cn("relative flex flex-col items-center justify-center rounded-cell transition-colors", hasWeather ? "h-18" : "h-13", isToday ? "bg-accent text-on-accent" : "text-ink hover:bg-sand", day.muster && !isToday && "hatch-line")}
    >
      <span className={cn("text-micro font-bold uppercase", isToday ? "text-today-sub" : "text-faint")}>{translate(day.weekday)}</span>
      <span className="text-cell-sm">{dayNumber(day.date)}</span>
      <ChangedLine day={day} isToday={isToday} className="h-2.5 max-w-full px-0.5 text-nano leading-none" />
      {hasWeather && <WeatherMini date={day.date} className={cn("mt-1 h-3 text-micro font-extrabold leading-none", isToday ? "text-on-accent" : "text-muted")} />}

      {/* крапка: сьогодні — світла, у дня є Klausur — фіолетова */}
      {isToday && <span className="absolute top-1.25 right-1.75 size-1.5 rounded-full bg-today-sub" />}
      {!isToday && day.exams.length > 0 && <span className="absolute top-1.25 right-1.75 size-1.5 rounded-full bg-accent" />}
    </Link>
  );
};

export default DayHeader;
