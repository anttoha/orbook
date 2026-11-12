import { cn } from "../../shared/utils/cn";
import { fachClasses } from "../../shared/utils/lessons";
import { FlagIcon } from "../ui/icons";

// Картинка-приклад на екрані входу (ПК): тиждень із макета. Це не дані школи:
// людина ще не ввійшла, тому малюємо статичний зразок і ховаємо його від скрінрідера.
const DAYS = [["MO", 15], ["DI", 16], ["MI", 17], ["DO", 18], ["FR", 19]];
const TODAY = 2;

// Клітинка: [предмет, кабінет, особливість]. "changed" — заміна, "cancelled" — fällt aus,
// "exam" — Klausur, null — уроку немає
const ROWS = [
  { period: 1, time: "07:30", cells: [["De", "102"], ["Ma", "108"], ["De", "102"], ["De", "102"], ["Ma", "Test", "exam"]] },
  { period: 2, time: "08:20", cells: [["Ma", "108"], ["Ph", "301"], ["Ma", "204", "changed"], ["Ma", "108"], ["En", "210"]] },
  { period: 3, time: "09:25", cells: [["En", "210"], ["De", "102"], ["En", "fällt aus", "cancelled"], ["Ph", "301"], ["De", "102"]] },
  { period: 4, time: "10:30", cells: [["Sp", "Halle"], ["En", "fällt aus", "cancelled"], ["Ph", "301"], ["Ge", "B12", "changed"], ["Bi", "305"]] },
  { period: 5, time: "11:35", cells: [["Ge", "108"], ["Ku", "012"], ["Ge", "108"], ["Sp", "Halle"], ["Ge", "108"]] },
  { period: 6, time: "12:25", cells: [["Bi", "305"], null, ["Sp", "Halle"], ["En", "210"], null] },
];
const NOW_ROW = 3; // лінія «зараз» проходить через 4-й урок

// Що вже минуло на зразку: понеділок, вівторок і ранок середи
const isPast = (row, day) => day < TODAY || (day === TODAY && row < NOW_ROW);

const Cell = ({ cell, past }) => {
  if (!cell) return <span className="rounded-cell bg-sand" />;
  const [subject, room, kind] = cell;
  // У школі код біології Bi, а на картці в макеті написано Bio
  const code = subject === "Bi" ? "Bio" : subject;

  if (kind === "cancelled") {
    return (
      <span className={cn("flex flex-col justify-between rounded-cell border border-dashed border-faint2 px-2 py-2", past && "opacity-45")}>
        <span className="text-hint font-semibold text-faint line-through">{code}</span>
        <span className="text-nano font-bold text-muted">{room}</span>
      </span>
    );
  }

  const special = kind === "changed" || kind === "exam";
  return (
    <span className={cn("relative flex flex-col justify-between rounded-cell px-2 py-2", fachClasses(subject, {}), kind === "changed" && "ring-2 ring-accent ring-inset", past && "opacity-45")}>
      <span className="text-hint font-black">{code}</span>
      <span className={cn(special ? "font-extrabold text-accent-ink" : "font-semibold", kind === "exam" ? "text-nano" : "text-room")}>{room}</span>
      {kind === "exam" && (
        <span className="absolute top-0 right-0 grid size-4.5 place-items-center rounded-tr-cell rounded-bl-chip bg-accent text-on-accent">
          <FlagIcon className="size-2.5" strokeWidth={3} />
        </span>
      )}
    </span>
  );
};

const WeekPreview = () => (
  <div aria-hidden="true" className="w-97.5 rounded-card bg-card p-4 shadow-sheet">
    <div className="grid grid-cols-[1.5rem_repeat(5,minmax(0,1fr))] gap-x-1 gap-y-1">
      <span />
      {DAYS.map(([name, number], day) => (
        <span key={name} className={cn("relative flex h-10.5 flex-col items-center justify-center rounded-cell", day === TODAY && "bg-accent")}>
          <span className={cn("text-micro font-bold", day === TODAY ? "text-today-sub" : "text-faint")}>{name}</span>
          <span className={cn("text-cell-sm", day === TODAY ? "text-on-accent" : "text-ink")}>{number}</span>
          {(day === TODAY || day === 4) && <span className={cn("absolute top-1.25 right-1.25 size-1.5 rounded-full", day === TODAY ? "bg-today-sub" : "bg-accent")} />}
        </span>
      ))}

      {ROWS.map((row, rowIndex) => (
        <div key={row.period} className="relative col-span-6 grid h-13 grid-cols-subgrid">
          <span className="flex flex-col items-center justify-center">
            <span className="text-hint font-bold text-ink">{row.period}</span>
            <span className="text-nano text-faint">{row.time}</span>
          </span>
          {row.cells.map((cell, day) => (
            <Cell key={day} cell={cell} past={isPast(rowIndex, day)} />
          ))}
          {rowIndex === NOW_ROW && (
            <span className="pointer-events-none absolute top-5 right-0 left-7 h-px bg-accent">
              <span className="absolute top-1/2 left-[39.5%] size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent" />
              <span className="absolute top-1/2 left-[39.5%] h-0.75 w-[19%] -translate-y-1/2 bg-accent" />
            </span>
          )}
        </div>
      ))}
    </div>
  </div>
);

export default WeekPreview;
