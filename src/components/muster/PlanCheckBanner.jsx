import { Bell } from "lucide-react";
import { useNow } from "../../shared/hooks/useNow";
import { useSheet } from "../../shared/hooks/useSheet";
import { useUserStore } from "../../shared/store/userStore";
import { planChecks } from "../../shared/utils/muster";

// ─────────────────────────────────────────────────────────────
// «Plan ist da · 2 Einträge prüfen» (макет 19 handy-06, pc-03): прийшов справжній план,
// а Klausur або нотатка висять на уроці, якого вже немає. «Prüfen» → шторка ?sheet=pruefen&datum=…
// ─────────────────────────────────────────────────────────────
const PlanCheckBanner = ({ day }) => {
  const { today } = useNow();
  const { openSheet } = useSheet();
  const notes = useUserStore((s) => s.notes);
  const dismissed = useUserStore((s) => s.checkedPlan);
  const count = planChecks(day, notes, dismissed, today).length;
  if (!count) return null;

  return (
    <button type="button" onClick={() => openSheet("pruefen", { datum: day.date })} className="flex items-center gap-2.5 rounded-field bg-tint px-3.25 py-2.5 text-left">
      <Bell className="size-4 shrink-0 text-accent-ink" />
      <span className="min-w-0 flex-1 text-label leading-4.5">
        <span className="block font-extrabold text-accent-ink">Plan ist da</span>
        <span className="block text-muted">{count === 1 ? "1 Eintrag prüfen" : `${count} Einträge prüfen`}</span>
      </span>
      <span className="shrink-0 text-label font-extrabold text-accent-ink">Prüfen</span>
    </button>
  );
};

export default PlanCheckBanner;
