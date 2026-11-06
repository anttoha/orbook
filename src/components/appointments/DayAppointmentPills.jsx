import { CalendarDays } from "lucide-react";
import { useAppointmentsOn } from "../../shared/hooks/useAppointments";
import { useSheet } from "../../shared/hooks/useSheet";
import { isFree, timeText } from "../../shared/utils/appointments";
import { cn } from "../../shared/utils/cn";

// ─────────────────────────────────────────────────────────────
// Смужка терміну під днем у тижні (макети 18 handy-09, pc-08) — як «весь день» у календарі телефона.
// Кілька термінів в один день — перший і «+1». Натискання відкриває вікно терміну.
// desktop — більша «пігулка» з іконкою і часом
// ─────────────────────────────────────────────────────────────
const DayAppointmentPills = ({ date, desktop = false }) => {
  const items = useAppointmentsOn(date);
  const { openSheet } = useSheet();
  if (items.length === 0) return null;
  const first = items[0];
  const time = desktop ? timeText(first) : null;

  return (
    <button
      type="button"
      onClick={() => openSheet("termin", { id: first.id })}
      title={items.map((item) => item.title).join(" · ")}
      className={cn(
        "flex w-full min-w-0 items-center gap-1 rounded-full font-extrabold outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
        desktop ? "h-6 px-2 text-note" : "h-5 px-1.75 text-nano",
        isFree(first) ? "bg-ok-tint text-ok" : "bg-tint text-accent-ink",
      )}
    >
      {desktop && <CalendarDays className="size-3.5 shrink-0" />}
      <span className="min-w-0 flex-1 truncate text-left">
        {first.title}
        {time && ` · ${time}`}
      </span>
      {items.length > 1 && <span className="shrink-0">+{items.length - 1}</span>}
    </button>
  );
};

export default DayAppointmentPills;
