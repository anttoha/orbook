import { RefreshCw } from "lucide-react";
import { useTicker } from "../../shared/hooks/useTicker";
import { usePlanStore } from "../../shared/store/planStore";
import { cn } from "../../shared/utils/cn";
import { mondayOf } from "../../shared/utils/format";
import { agoText } from "../../shared/utils/liveText";

// ─────────────────────────────────────────────────────────────
// Строка в дне без плана (часть 26, макет handy-12): «Geprüft gerade eben · noch kein Plan · Jetzt prüfen».
// Видно, что день правда проверяли (day.checkedAt), а не просто «не знаем». checkedAt null → «Noch nicht geprüft».
// «Jetzt prüfen» проверяет всю неделю этого дня.
// ─────────────────────────────────────────────────────────────
const DayCheckRow = ({ day, className }) => {
  const now = useTicker();
  const refreshPlan = usePlanStore((s) => s.refreshPlan);
  const refreshing = usePlanStore((s) => s.refreshing);
  const ago = agoText(day.checkedAt, now);

  return (
    <div className={cn("flex items-center gap-2.5 rounded-field bg-card px-3.25 py-3 text-label", className)}>
      <RefreshCw className={cn("size-4 shrink-0 text-muted", refreshing && "motion-safe:animate-spin")} />
      <p className="min-w-0 flex-1 text-muted">{refreshing ? "Wird geprüft…" : ago ? `Geprüft ${ago} · noch kein Plan` : "Noch nicht geprüft"}</p>
      <button type="button" disabled={refreshing} onClick={() => refreshPlan(mondayOf(day.date))} className="shrink-0 font-extrabold text-accent-ink disabled:opacity-50">
        Jetzt prüfen
      </button>
    </div>
  );
};

export default DayCheckRow;
