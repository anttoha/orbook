import { cn } from "../../shared/utils/cn";
import { monthWeeks } from "../../shared/utils/calendar";
import { addDays, dayNumber, isoWeek, isWeekend, longDate, weekdayLong } from "../../shared/utils/format";

// Заголовки колонок
const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const NO_DAYS = new Set(); // порожній набір за замовчуванням (один на всіх)

// ─────────────────────────────────────────────────────────────
// Сітка місяця: колонка KW + 7 днів. Спільна для «Woche wählen» і календаря Klausuren.
//   month      — перше число місяця ("2026-10-01")
//   today      — сьогодні: фіолетовий кружечок
//   highlight  — понеділок тижня, рядок якого підсвічено
//   rowShape   — форма підсвітки: "pill" (вибір тижня) або "tile" (поточний тиждень, макет Klausuren)
//   examDays / freeDays — набори дат: крапка під числом (фіолетова / сіра)
//   weekLetter(понеділок) — буква тижня циклу «A»/«B» біля KW або null (частина 19, «Woche wählen»)
//   onPick(день) — клік по дню
// ─────────────────────────────────────────────────────────────
const MonthGrid = ({ month, today, highlight, rowShape = "pill", examDays = NO_DAYS, freeDays = NO_DAYS, weekLetter, onPick }) => (
  <div className="flex flex-col gap-1">
    <div className="grid grid-cols-8 text-center text-small font-extrabold text-faint">
      <span>KW</span>
      {WEEKDAYS.map((d) => (
        <span key={d}>{d}</span>
      ))}
    </div>

    {monthWeeks(month).map((monday) => (
      <div key={monday} className={cn("grid grid-cols-8 items-center", rowShape === "pill" ? "rounded-full" : "rounded-tile", monday === highlight && "bg-tint")}>
        {/* номер тижня */}
        <span className="text-center text-small font-extrabold text-faint">
          {isoWeek(monday)}
          {weekLetter?.(monday) && <span className="ml-0.5 font-black text-accent-ink">{weekLetter(monday)}</span>}
        </span>

        {Array.from({ length: 7 }, (_, i) => addDays(monday, i)).map((day) => {
          const inMonth = day.slice(0, 7) === month.slice(0, 7); // день цього місяця?
          const isFree = freeDays.has(day); // канікули / свято
          const hasExam = examDays.has(day);
          return (
            <button
              key={day}
              type="button"
              onClick={() => onPick(day)}
              aria-label={`${weekdayLong(day)}, ${longDate(day)}${hasExam ? " · Klausur" : ""}${isFree ? " · frei" : ""}`}
              className="relative mx-auto grid size-9 place-items-center"
            >
              <span
                className={cn(
                  "grid size-8 place-items-center rounded-full text-body-sm",
                  // у календарі Klausuren звичайні дні тонші, поточний тиждень жирніший (макет 14)
                  rowShape === "pill" || monday === highlight ? "font-extrabold" : "font-medium",
                  day === today && "bg-accent text-on-accent", // сьогодні — фіолетовий кружечок
                  day !== today && (!inMonth ? "text-faint2" : isWeekend(day) || isFree ? "text-faint" : "text-ink"),
                )}
              >
                {dayNumber(day)}
              </span>
              {/* крапка під числом: Klausur — фіолетова, вільний день — сіра */}
              {(hasExam || isFree) && <span className={cn("absolute bottom-0 size-1 rounded-full", hasExam ? "bg-accent" : "bg-faint2")} />}
            </button>
          );
        })}
      </div>
    ))}
  </div>
);

export default MonthGrid;
