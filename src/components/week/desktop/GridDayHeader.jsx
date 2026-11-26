import { Info } from "lucide-react";
import { useSheet } from "../../../shared/hooks/useSheet";
import { cn } from "../../../shared/utils/cn";
import DayAppointmentPills from "../../appointments/DayAppointmentPills";
import ChangedLine from "../ChangedLine";
import WeatherMini from "../../weather/WeatherMini";
import { useWeather } from "../../../shared/hooks/useWeather";
import { dayNumber, longDate, weekdayLong } from "../../../shared/utils/format";
import RoundButton from "../../ui/RoundButton";
import { useT } from "../../../shared/hooks/useT";
import { translate } from "../../../shared/i18n/translate";

// ─────────────────────────────────────────────────────────────
// Шапка дня в сітці тижня на ПК: «15 MO» (сьогодні — фіолетова «пігулка»).
// Кнопка (i) — у КОЖНОГО дня: відкриває «Info zum Tag» (коли план змінився, опубліковано, перевірено,
// текст школи). Фіолетова — є що почитати (Info zum Tag або Klausur), сіра — лише час оновлення.
// Кнопка лежить поверх шапки, а не всередині: кнопку не можна вкладати в посилання чи іншу кнопку.
// as — чим рендерити саму шапку (Link або button), решта пропсів — їй же; style — місце в сітці
// ─────────────────────────────────────────────────────────────
const GridDayHeader = ({ as: Component = "button", day, isToday, className, style, ...props }) => {
  const t = useT();
  const { openSheet } = useSheet();
  const hasNews = day.info.length > 0 || day.exams.length > 0; // є що подивитись
  const hasWeather = Boolean(useWeather().weather); // часть 50a: у школы есть погода

  return (
    <div className={cn("relative flex flex-col gap-1.5", className)} style={style}>
      <Component
        {...props}
        aria-label={`${weekdayLong(day.date)}, ${longDate(day.date)}`}
        data-tour={isToday && Component !== "button" ? "heute" : undefined} // Rundgang: только ссылка на день, кнопка лишь выбирает его справа
        className={cn("flex w-full flex-col", hasWeather ? "h-18" : "h-13", "justify-center rounded-cell px-3 pr-9 text-left transition-colors", isToday ? "bg-accent text-on-accent" : "text-ink hover:bg-sand", day.muster && !isToday && "hatch-line")}
      >
        <span className="flex items-center gap-2">
          <span className="text-heading leading-none">{dayNumber(day.date)}</span>
          <span className={cn("text-small font-extrabold uppercase", isToday ? "text-today-sub" : "text-faint")}>{translate(day.weekday)}</span>
        </span>
        <ChangedLine day={day} isToday={isToday} className="h-3.5 text-note leading-none" />
        {/* часть 50a: погода дня третьей строкой — колонки узкие, справа сверху кнопка (i) */}
        {hasWeather && <WeatherMini date={day.date} className={cn("mt-1 h-4 text-label font-black leading-none", isToday ? "text-on-accent" : "text-ink")} iconClassName={cn("size-4", isToday ? "text-on-accent" : "text-muted")} />}
      </Component>
      {/* терміни дня (частина 18): під шапкою, як «весь день» у календарі */}
      <DayAppointmentPills date={day.date} desktop />

      <RoundButton
        onClick={() => openSheet("info", { datum: day.date })}
        aria-label={t("Info zum Tag · {1}", { "1": weekdayLong(day.date) })}
        title={t("Info zum Tag")}
        style={{ "--lg-h": "1.75rem" }} // «Glas»: кнопка библиотеки того же размера 28px, что и наша, — не вылезает за плашку дня
        look={cn(
          "absolute right-1.5 -mt-3.5 grid", hasWeather ? "top-9" : "top-6.5", " size-7 place-items-center rounded-full outline-none transition-colors focus-visible:ring-2 focus-visible:ring-accent/50",
          isToday ? "text-today-sub hover:bg-on-accent/15" : hasNews ? "text-accent hover:bg-tint" : "text-faint hover:bg-card hover:text-ink",
        )}>
        <Info className="size-4" />
      </RoundButton>
    </div>
  );
};

export default GridDayHeader;
