import { CalendarDays, ChevronRight, Sun } from "lucide-react";
import { useAppointmentsOn } from "../../shared/hooks/useAppointments";
import { useSheet } from "../../shared/hooks/useSheet";
import { isFree, periodsText, sourceText, timeText } from "../../shared/utils/appointments";
import { cn } from "../../shared/utils/cn";
import { useT } from "../../shared/hooks/useT";
import { translate } from "../../shared/i18n/translate";

// «ab 09:25, Aula. Eingetragen von der Schule.» — після назви в плашці. У «Frei» — уроки: «5.–6. Stunde.»
const details = (item) => {
  const where = isFree(item) ? periodsText(item.periods) : [timeText(item), item.place].filter(Boolean).join(", ");
  const source = sourceText(item, null);
  const by = source.name ? translate("Eingetragen von {name}.", { name: source.name }) : "";
  return [where && `${where}.`, by].filter(Boolean).join(" ");
};

// ─────────────────────────────────────────────────────────────
// Плашка «Termin: …» у дні під «Info zum Tag» (макети 18 handy-10, pc-08): як Info, тільки фіолетова.
// Для кожного терміну дня — своя плашка; натискання відкриває вікно терміну. «Frei» — зелена «Frei: …» (частина 53).
// ─────────────────────────────────────────────────────────────
const AppointmentBanner = ({ date, className }) => {
  const t = useT();
  const items = useAppointmentsOn(date);
  const { openSheet } = useSheet();
  if (items.length === 0) return null;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {items.map((item) => {
        const free = isFree(item);
        const Icon = free ? Sun : CalendarDays;
        return (
          <button key={item.id} type="button" onClick={() => openSheet("termin", { id: item.id })} className={cn("flex items-start gap-2.5 rounded-field px-3.25 py-3 text-left text-label leading-4.5 text-muted outline-none focus-visible:ring-2 focus-visible:ring-accent/50", free ? "bg-ok-tint" : "bg-tint")}>
            <Icon className={cn("size-4 shrink-0", free ? "text-ok" : "text-accent-ink")} />
            <p className="line-clamp-2 min-w-0 flex-1">
              <span className={cn("font-bold", free ? "text-ok" : "text-accent-ink")}>{free ? t("Frei:") : t("Termin:")}</span> {item.title}
              {details(item) && ` · ${details(item)}`}
            </p>
            <ChevronRight className="size-3.75 shrink-0 text-faint" />
          </button>
        );
      })}
    </div>
  );
};

export default AppointmentBanner;
