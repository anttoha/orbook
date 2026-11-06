import { RefreshCw } from "lucide-react";
import { usePlanStore } from "../../shared/store/planStore";
import { cn } from "../../shared/utils/cn";

// Маленька кнопка «Neu laden» (POST /api/plan/refresh). Раніше була лише в меню «⋮» — її не знаходили.
// Поки йде запит, значок крутиться, повторно натиснути не можна
const RefreshButton = ({ className }) => {
  const refreshPlan = usePlanStore((s) => s.refreshPlan);
  const refreshing = usePlanStore((s) => s.refreshing);

  return (
    <button
      type="button"
      onClick={refreshPlan}
      disabled={refreshing}
      className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-caption font-bold text-accent-ink outline-none transition-colors hover:bg-tint focus-visible:ring-2 focus-visible:ring-accent/50 disabled:opacity-60", className)}
    >
      <RefreshCw className={cn("size-3.5", refreshing && "motion-safe:animate-spin")} />
      {refreshing ? "Wird geladen…" : "Neu laden"}
    </button>
  );
};

export default RefreshButton;
