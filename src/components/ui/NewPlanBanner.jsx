import { Bell } from "lucide-react";
import { useNow } from "../../shared/hooks/useNow";
import { useLessonFilter } from "../../shared/hooks/usePlan";
import { usePlanStore } from "../../shared/store/planStore";
import { changeText } from "../../shared/utils/planDiff";

// Плашка «Neuer Plan · Morgen: 4. Std Geschichte → Vertretung · Ansehen».
// Перша зміна серед курсів учня: про чужий курс писати немає сенсу. Таких немає — просто «Neuer Plan da».
const NewPlanBanner = () => {
  const newPlan = usePlanStore((s) => s.newPlan);
  const seeNewPlan = usePlanStore((s) => s.seeNewPlan);
  const filter = useLessonFilter();
  const { today } = useNow();

  if (!newPlan) return null;
  const change = newPlan.changes.find((item) => filter([item.lesson]).length > 0);

  return (
    <div role="status" className="flex items-start gap-2.5 rounded-field bg-tint px-3.25 py-3 text-label leading-4.5 text-accent-ink">
      <Bell className="size-4 shrink-0" />
      <p className="min-w-0 flex-1">
        <span className="font-bold">{change ? "Neuer Plan ·" : "Neuer Plan da"}</span> {change && changeText(change, today)}
      </p>
      <button type="button" onClick={seeNewPlan} className="shrink-0 font-bold">
        Ansehen
      </button>
    </div>
  );
};

export default NewPlanBanner;
