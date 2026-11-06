import { CalendarDays, ChevronRight } from "lucide-react";
import { useAppointmentsOn } from "../../shared/hooks/useAppointments";
import { useSheet } from "../../shared/hooks/useSheet";
import { sourceText, timeText } from "../../shared/utils/appointments";
import { cn } from "../../shared/utils/cn";

// «ab 09:25, Aula. Eingetragen von der Schule.» — після назви в плашці
const details = (item) => {
  const where = [timeText(item), item.place].filter(Boolean).join(", ");
  const source = sourceText(item, null);
  const by = source.name ? `Eingetragen von ${source.name}.` : "";
  return [where && `${where}.`, by].filter(Boolean).join(" ");
};

// ─────────────────────────────────────────────────────────────
// Плашка «Termin: …» у дні під «Info zum Tag» (макети 18 handy-10, pc-08): як Info, тільки фіолетова.
// Для кожного терміну дня — своя плашка; натискання відкриває вікно терміну.
// ─────────────────────────────────────────────────────────────
const AppointmentBanner = ({ date, className }) => {
  const items = useAppointmentsOn(date);
  const { openSheet } = useSheet();
  if (items.length === 0) return null;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {items.map((item) => (
        <button key={item.id} type="button" onClick={() => openSheet("termin", { id: item.id })} className="flex items-start gap-2.5 rounded-field bg-tint px-3.25 py-3 text-left text-label leading-4.5 text-muted outline-none focus-visible:ring-2 focus-visible:ring-accent/50">
          <CalendarDays className="size-4 shrink-0 text-accent-ink" />
          <p className="line-clamp-2 min-w-0 flex-1">
            <span className="font-bold text-accent-ink">Termin:</span> {item.title}
            {details(item) && ` · ${details(item)}`}
          </p>
          <ChevronRight className="size-3.75 shrink-0 text-faint" />
        </button>
      ))}
    </div>
  );
};

export default AppointmentBanner;
