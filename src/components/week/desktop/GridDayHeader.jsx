import { Info } from "lucide-react";
import { cn } from "../../../shared/utils/cn";
import ChangedLine from "../ChangedLine";
import { dayNumber, longDate, weekdayLong } from "../../../shared/utils/format";

// ─────────────────────────────────────────────────────────────
// Шапка дня в сітці тижня на ПК: «15 MO» (сьогодні — фіолетова «пігулка»).
// Значок (i) — у дня є «Info zum Tag» або Klausur.
// as — чим рендерити (Link або button), решта пропсів — йому ж
// ─────────────────────────────────────────────────────────────
const GridDayHeader = ({ as: Component = "button", day, isToday, className, ...props }) => {
  const hasNews = day.info.length > 0 || day.exams.length > 0; // є що подивитись

  return (
    <Component
      {...props}
      aria-label={`${weekdayLong(day.date)}, ${longDate(day.date)}`}
      className={cn("flex h-13 flex-col justify-center rounded-cell px-3 text-left transition-colors", isToday ? "bg-accent text-on-accent" : "text-ink hover:bg-sand", className)}
    >
      <span className="flex items-center gap-2">
        <span className="text-heading leading-none">{dayNumber(day.date)}</span>
        <span className={cn("text-small font-extrabold uppercase", isToday ? "text-today-sub" : "text-faint")}>{day.weekday}</span>
        {hasNews && <Info className={cn("ml-auto size-4 shrink-0", isToday ? "text-today-sub" : "text-accent")} />}
      </span>
      <ChangedLine day={day} isToday={isToday} className="h-3.5 text-note leading-none" />
    </Component>
  );
};

export default GridDayHeader;
