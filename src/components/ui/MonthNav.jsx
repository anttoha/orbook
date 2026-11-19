import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../shared/utils/cn";
import { monthLong } from "../../shared/utils/format";
import { shiftMonth } from "../../shared/utils/calendar";
import RoundButton from "./RoundButton";
import { useT } from "../../shared/hooks/useT";

// ─────────────────────────────────────────────────────────────
// «‹  September 2026  ›» над сіткою місяця.
// month — перше число; onChange(нове перше число); canGoNext — чи можна далі
// titleClassName — розмір назви (у «Woche wählen» менший, ніж у календарі Klausuren)
// ─────────────────────────────────────────────────────────────

const MonthNav = ({ month, onChange, canGoNext = true, titleClassName = "text-subhead" }) => {
  const t = useT();
  return (
  <div className="flex items-center justify-between">
    <RoundButton aria-label={t("Vorheriger Monat")} onClick={() => onChange(shiftMonth(month, -1))}>
      <ChevronLeft className="size-4.5" />
    </RoundButton>
    <p className={cn("text-ink", titleClassName)}>
      {monthLong(month)} {month.slice(0, 4)}
    </p>
    <RoundButton aria-label={t("Nächster Monat")} disabled={!canGoNext} onClick={() => onChange(shiftMonth(month, 1))}>
      <ChevronRight className="size-4.5" />
    </RoundButton>
  </div>
);
};

export default MonthNav;
