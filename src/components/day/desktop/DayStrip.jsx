import { Link } from "react-router-dom";
import { CircleDashed } from "lucide-react";
import { cn } from "../../../shared/utils/cn";
import { FlagIcon } from "../../ui/icons";

// ─────────────────────────────────────────────────────────────
// Смуга днів тижня над списком (макет «Tag · Liste»):
//   MO 5.   DI 6. ◌   [MI 7. heute]   DO 8. •   FR 9. ⚑
// Значки праворуч: ◌ — щось скасовано, • — зміна (Vertretung, Raum), ⚑ — Klausur.
// days — дні тижня з сервера; date — відкритий день
// ─────────────────────────────────────────────────────────────
// Вибраний день — одна фіолетова «пігулка» під кнопками, яка плавно їде до нового дня (як у Segmented).
// Кнопки однакової ширини (flex-1), тому зсув = номер × (ширина + проміжок 4px)
const DayStrip = ({ days, date, today }) => {
  const index = days.findIndex((day) => day.date === date);

  return (
    <nav aria-label="Wochentage" className="relative flex h-13 gap-1 rounded-full bg-sand p-1">
      {index >= 0 && (
        <span
          aria-hidden="true"
          className="absolute inset-y-1 left-1 rounded-full bg-accent transition-[translate] duration-300 ease-soft motion-reduce:transition-none"
          style={{ width: `calc((100% - 0.5rem - ${days.length - 1} * 0.25rem) / ${days.length})`, translate: `calc(${index} * (100% + 0.25rem)) 0` }}
        />
      )}
      {days.map((day) => {
        const active = day.date === date; // відкритий день
        // найважливіша подія дня
        const marker =
          day.exams.length > 0
            ? "exam"
            : day.lessons.some((l) => l.status !== "normal" && l.status !== "cancelled")
              ? "changed"
              : day.lessons.some((l) => l.status === "cancelled")
                ? "cancelled"
                : null;

        return (
          <Link
            key={day.date}
            to={`/tag/${day.date}`}
            aria-current={active ? "page" : undefined}
            className={cn("relative flex min-w-0 flex-1 items-center gap-2 rounded-full px-4 transition-colors duration-300", active ? "text-on-accent" : "text-ink hover:bg-card/60")}
          >
            <span className={cn("text-caption font-extrabold uppercase", active ? "text-today-sub" : "text-faint")}>{day.weekday}</span>
            <span className="text-body font-black">{Number(day.date.slice(8))}.</span>
            {day.date === today && <span className={cn("text-small font-semibold", active ? "text-today-sub" : "text-accent")}>heute</span>}

            {/* значок праворуч */}
            <span className={cn("ml-auto", active ? "text-today-sub" : "text-accent")}>
              {marker === "exam" && <FlagIcon className="size-3.5" />}
              {marker === "changed" && <span className="block size-2 rounded-full bg-current" />}
              {marker === "cancelled" && <CircleDashed className="size-3.5 text-faint" />}
            </span>
          </Link>
        );
      })}
    </nav>
  );
};

export default DayStrip;
