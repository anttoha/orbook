import { Bell } from "lucide-react";
import { useNow } from "../../shared/hooks/useNow";
import { useLessonFilter } from "../../shared/hooks/usePlan";
import { useTicker } from "../../shared/hooks/useTicker";
import { usePlanStore } from "../../shared/store/planStore";
import { agoText } from "../../shared/utils/liveText";
import { changeText } from "../../shared/utils/planDiff";

// Плашка «Neuer Plan · gerade eben / Morgen: 4. Std Geschichte → Vertretung · Ansehen».
// Перша зміна серед курсів учня: про чужий курс писати немає сенсу. Таких немає — просто «Neuer Plan da».
// Часть 26: приходит сама (поток Live) — въезжает сверху, колокольчик качнётся один раз.
const NewPlanBanner = () => {
  const newPlan = usePlanStore((s) => s.newPlan);
  const seeNewPlan = usePlanStore((s) => s.seeNewPlan);
  const filter = useLessonFilter({ mine: true }); // банер — лише про мої курси
  const { today } = useNow();
  const now = useTicker(15_000);

  if (!newPlan) return null;
  const change = newPlan.changes.find((item) => filter([item.lesson]).length > 0);
  const ago = agoText(newPlan.lastChangeAt, now);

  return (
    <div key={newPlan.lastChangeAt} role="status" className="flex items-center gap-2.5 rounded-field bg-tint px-3.25 py-3 text-label leading-4.5 text-accent-ink motion-safe:animate-drop-in">
      <Bell className="size-4 shrink-0 origin-top motion-safe:animate-bell-ring" />
      <div className="min-w-0 flex-1">
        <p>
          <span className="font-bold">{change ? "Neuer Plan" : "Neuer Plan da"}</span>
          {ago && <span className="text-muted"> · {ago}</span>}
        </p>
        {change && <p className="text-ink">{changeText(change, today)}</p>}
      </div>
      <button type="button" onClick={seeNewPlan} className="shrink-0 font-bold">
        Ansehen
      </button>
    </div>
  );
};

export default NewPlanBanner;
