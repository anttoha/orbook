import { Link } from "react-router-dom";
import { CircleDashed, Flag } from "lucide-react";
import { cn } from "../../../shared/utils/cn";

// ─────────────────────────────────────────────────────────────
// Смуга днів тижня над списком (макет «Tag · Liste»):
//   MO 5.   DI 6. ◌   [MI 7. heute]   DO 8. •   FR 9. ⚑
// Значки праворуч: ◌ — щось скасовано, • — зміна (Vertretung, Raum), ⚑ — Klausur.
// days — дні тижня з сервера; date — відкритий день; search — хвіст адреси (вигляд)
// ─────────────────────────────────────────────────────────────
const DayStrip = ({ days, date, today, search }) => {
  return (
    <nav aria-label="Wochentage" className="flex h-13 gap-1 rounded-full bg-sand p-1">
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
            to={`/tag/${day.date}${search}`}
            aria-current={active ? "page" : undefined}
            className={cn("flex min-w-0 flex-1 items-center gap-2 rounded-full px-4 transition-colors", active ? "bg-accent text-on-accent" : "text-ink hover:bg-card/60")}
          >
            <span className={cn("text-caption font-extrabold uppercase", active ? "text-today-sub" : "text-faint")}>{day.weekday}</span>
            <span className="text-body font-black">{Number(day.date.slice(8))}.</span>
            {day.date === today && <span className={cn("text-small font-semibold", active ? "text-today-sub" : "text-accent")}>heute</span>}

            {/* значок праворуч */}
            <span className={cn("ml-auto", active ? "text-today-sub" : "text-accent")}>
              {marker === "exam" && <Flag className="size-3.5" />}
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
