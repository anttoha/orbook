import { cn } from "../../shared/utils/cn";
import { metaText, whenText } from "../../shared/utils/appointments";
import Badge from "../ui/Badge";
import AppointmentBadge from "./AppointmentBadge";
import AppointmentDateTile from "./AppointmentDateTile";

// ─────────────────────────────────────────────────────────────
// Рядок терміну (макет 18 handy-01):
//   [29 MO]  AUSFLUG  Physik · 07:45–15:00 · von Ric      in 12 Tagen
//            Exkursion Phänomenta
// highlight — найближчий (рамка), fresh — щойно збережений (мітка «Neu» замість «коли»)
// ─────────────────────────────────────────────────────────────
const AppointmentRow = ({ item, today, highlight, fresh, onClick }) => {
  const meta = metaText(item);
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn("flex w-full items-center gap-3 rounded-card bg-card px-3 py-2.5 text-left outline-none focus-visible:ring-2 focus-visible:ring-accent/50", highlight && "border border-accent")}
    >
      <AppointmentDateTile item={item} iso={item.dateFrom < today ? today : item.dateFrom} />
      <span className="min-w-0 flex-1">
        <span className="flex min-w-0 items-center gap-1.75">
          <AppointmentBadge item={item} />
          {meta && <span className="truncate text-note text-faint">{meta}</span>}
        </span>
        <span className="mt-1 block truncate text-row font-extrabold text-ink">{item.title}</span>
      </span>
      {fresh ? <Badge variant="changed">Neu</Badge> : <span className={cn("shrink-0 text-caption font-bold", highlight ? "text-accent-ink" : "text-faint")}>{whenText(item, today)}</span>}
    </button>
  );
};

export default AppointmentRow;
