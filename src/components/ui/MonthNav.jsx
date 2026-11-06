import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../shared/utils/cn";
import { monthLong } from "../../shared/utils/format";
import { shiftMonth } from "../../shared/utils/calendar";

// ─────────────────────────────────────────────────────────────
// «‹  September 2026  ›» над сіткою місяця.
// month — перше число; onChange(нове перше число); canGoNext — чи можна далі
// titleClassName — розмір назви (у «Woche wählen» менший, ніж у календарі Klausuren)
// ─────────────────────────────────────────────────────────────
const arrow = "grid size-9 place-items-center rounded-full bg-card text-muted transition-colors hover:bg-sand disabled:opacity-40";

const MonthNav = ({ month, onChange, canGoNext = true, titleClassName = "text-subhead" }) => (
  <div className="flex items-center justify-between">
    <button type="button" aria-label="Vorheriger Monat" onClick={() => onChange(shiftMonth(month, -1))} className={arrow}>
      <ChevronLeft className="size-4.5" />
    </button>
    <p className={cn("text-ink", titleClassName)}>
      {monthLong(month)} {month.slice(0, 4)}
    </p>
    <button type="button" aria-label="Nächster Monat" disabled={!canGoNext} onClick={() => onChange(shiftMonth(month, 1))} className={arrow}>
      <ChevronRight className="size-4.5" />
    </button>
  </div>
);

export default MonthNav;
