import { cn } from "../../shared/utils/cn";
import { isFree } from "../../shared/utils/appointments";
import { dayNumber, weekdayShort } from "../../shared/utils/format";

// Плашка дати терміну: «29 MO». Вільний день — зелений, решта — фіолетовий (макет 18 handy-01).
// iso — який день показати (для терміну, що вже йде, — сьогодні)
const AppointmentDateTile = ({ item, iso = item.dateFrom }) => (
  <span className={cn("flex h-11 w-9.5 shrink-0 flex-col items-center justify-center rounded-tile", isFree(item) ? "bg-ok-tint text-ok" : "bg-tint text-accent-ink")}>
    <span className="text-cell leading-none">{dayNumber(iso).padStart(2, "0")}</span>
    <span className="mt-0.5 text-tiny font-bold tracking-badge uppercase">{weekdayShort(iso)}</span>
  </span>
);

export default AppointmentDateTile;
