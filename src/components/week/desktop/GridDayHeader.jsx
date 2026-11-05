import { Info } from "lucide-react";
import { cn } from "../../../shared/utils/cn";
import { changedText, dayNumber, longDate, weekdayLong } from "../../../shared/utils/format";

// ─────────────────────────────────────────────────────────────
// Шапка дня в сітці тижня на ПК: «15 MO» (сьогодні — фіолетова «пігулка»).
// Значок (i) — у дня є «Info zum Tag» або Klausur.
// as — чим рендерити (Link або button), решта пропсів — йому ж
// ─────────────────────────────────────────────────────────────
const GridDayHeader = ({ as: Component = "button", day, isToday, className, style, ...props }) => {
  const hasNews = day.info.length > 0 || day.exams.length > 0; // є що подивитись

  const changed = changedText(day);

  return (
    <div style={style}>
      <Component
        {...props}
        aria-label={`${weekdayLong(day.date)}, ${longDate(day.date)}`}
        className={cn("flex h-13 w-full items-center gap-2 rounded-cell px-3 text-left transition-colors", isToday ? "bg-accent text-on-accent" : "text-ink hover:bg-sand", className)}
      >
        <span className="text-heading leading-none">{dayNumber(day.date)}</span>
        <span className={cn("text-small font-extrabold uppercase", isToday ? "text-today-sub" : "text-faint")}>{day.weekday}</span>
        {hasNews && <Info className={cn("ml-auto size-4 shrink-0", isToday ? "text-today-sub" : "text-accent")} />}
      </Component>
      {changed && <p className="mt-0.5 px-3 text-note text-faint">{changed}</p>}
    </div>
  );
};

export default GridDayHeader;
