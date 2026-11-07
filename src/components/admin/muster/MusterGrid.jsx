import { cn } from "../../../shared/utils/cn";
import { gridPeriods, isOwnChange, slotLessons, WEEKDAYS, WEEKDAYS_LONG } from "../../../shared/utils/musterEditor";
import MusterCell from "./MusterCell";

// ─────────────────────────────────────────────────────────────
// Сітка Mo–Fr × уроки, як «Woche» (Soft 04), але без дат: Muster однаковий для кожного тижня A (чи B).
//   lessons     — уроки цього тижня (A або B), auto — автоматика того ж тижня (для крапки «своя правка»)
//   mode        — "auto" (лише дивитись) | "admin" (клік → onPick({ weekday, period }))
//   selected    — відкрита клітинка; lessonTimes — час уроків зліва
// ─────────────────────────────────────────────────────────────
const MusterGrid = ({ lessons, auto, mode, lessonTimes, names, selected, onPick, desktop = false }) => {
  const rows = gridPeriods(lessonTimes, lessons, auto);

  return (
    <div className={cn("grid grid-cols-[auto_repeat(5,minmax(0,1fr))]", desktop ? "gap-x-3 gap-y-2.5" : "gap-1")}>
      <span />
      {(desktop ? WEEKDAYS_LONG : WEEKDAYS).map((day) => (
        <span key={day} className={cn("font-extrabold text-faint", desktop ? "pb-1 pl-3 text-label" : "pb-1 text-center text-micro tracking-wide uppercase")}>
          {day}
        </span>
      ))}

      {rows.map(({ period, start, end }) => (
        <div key={period} className="contents">
          {/* номер і час уроку зліва */}
          <div className={cn("flex flex-col justify-center leading-tight", desktop ? "w-13" : "w-7.5 items-center")}>
            <span className={cn("text-ink", desktop ? "text-number" : "text-label font-bold")}>{period}</span>
            {start && <span className="text-tiny text-faint">{start}</span>}
            {desktop && end && <span className="text-tiny text-faint">{end}</span>}
          </div>
          {WEEKDAYS.map((day, weekday) => (
            <div key={day} className={desktop ? "h-22" : "h-13"}>
              <MusterCell
                entries={slotLessons(lessons, weekday, period)}
                mode={mode}
                names={names}
                desktop={desktop}
                changed={mode === "admin" && isOwnChange(lessons, auto, weekday, period)}
                selected={selected?.weekday === weekday && selected?.period === period}
                label={`${WEEKDAYS_LONG[weekday]}, ${period}. Stunde`}
                onClick={() => onPick?.({ weekday, period })}
              />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default MusterGrid;
