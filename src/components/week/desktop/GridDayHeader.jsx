import { Info } from "lucide-react";
import { useSheet } from "../../../shared/hooks/useSheet";
import { cn } from "../../../shared/utils/cn";
import DayAppointmentPills from "../../appointments/DayAppointmentPills";
import ChangedLine from "../ChangedLine";
import { dayNumber, longDate, weekdayLong } from "../../../shared/utils/format";

// ─────────────────────────────────────────────────────────────
// Шапка дня в сітці тижня на ПК: «15 MO» (сьогодні — фіолетова «пігулка»).
// Кнопка (i) — у КОЖНОГО дня: відкриває «Info zum Tag» (коли план змінився, опубліковано, перевірено,
// текст школи). Фіолетова — є що почитати (Info zum Tag або Klausur), сіра — лише час оновлення.
// Кнопка лежить поверх шапки, а не всередині: кнопку не можна вкладати в посилання чи іншу кнопку.
// as — чим рендерити саму шапку (Link або button), решта пропсів — їй же; style — місце в сітці
// ─────────────────────────────────────────────────────────────
const GridDayHeader = ({ as: Component = "button", day, isToday, className, style, ...props }) => {
  const { openSheet } = useSheet();
  const hasNews = day.info.length > 0 || day.exams.length > 0; // є що подивитись

  return (
    <div className={cn("relative flex flex-col gap-1.5", className)} style={style}>
      <Component
        {...props}
        aria-label={`${weekdayLong(day.date)}, ${longDate(day.date)}`}
        className={cn("flex h-13 w-full flex-col justify-center rounded-cell px-3 pr-9 text-left transition-colors", isToday ? "bg-accent text-on-accent" : "text-ink hover:bg-sand", day.muster && !isToday && "hatch-line")}
      >
        <span className="flex items-center gap-2">
          <span className="text-heading leading-none">{dayNumber(day.date)}</span>
          <span className={cn("text-small font-extrabold uppercase", isToday ? "text-today-sub" : "text-faint")}>{day.weekday}</span>
        </span>
        <ChangedLine day={day} isToday={isToday} className="h-3.5 text-note leading-none" />
      </Component>
      {/* терміни дня (частина 18): під шапкою, як «весь день» у календарі */}
      <DayAppointmentPills date={day.date} desktop />

      <button
        type="button"
        onClick={() => openSheet("info", { datum: day.date })}
        aria-label={`Info zum Tag · ${weekdayLong(day.date)}`}
        title="Info zum Tag"
        className={cn(
          "absolute top-6.5 right-1.5 grid size-7 -translate-y-1/2 place-items-center rounded-full outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent/50",
          isToday ? "text-today-sub hover:bg-on-accent/15" : hasNews ? "text-accent hover:bg-tint" : "text-faint hover:bg-card hover:text-ink",
        )}
      >
        <Info className="size-4" />
      </button>
    </div>
  );
};

export default GridDayHeader;
