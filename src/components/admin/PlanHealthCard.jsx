import { usePlanRefresh } from "../../shared/hooks/usePlanRefresh";
import { HEALTH, hoursStrip, planHealth, planTimesText, serverLine } from "../../shared/utils/admin";
import { cn } from "../../shared/utils/cn";
import Badge from "../ui/Badge";
import { RenewIcon } from "../ui/icons";
import PillButton from "../ui/PillButton";

const BAR = { ok: "bg-ok", error: "bg-danger" }; // null (опиту не було) — сірий
const CHIP = { ok: "ok", warn: "changed", error: "danger" };

// 24 стовпчики «Letzte 24 Stunden» (найстаріша година ліворуч)
const HoursStrip = ({ hours }) => (
  <div>
    <div className="flex h-3 gap-0.75" role="img" aria-label="Plan-Abruf in den letzten 24 Stunden">
      {hoursStrip(hours).map((h, i) => (
        <span key={i} title={`${h.hour} Uhr`} className={cn("flex-1 rounded-tick", BAR[h.status] ?? "bg-rule", h.status === "error" && "-mt-1 h-4")} />
      ))}
    </div>
    <p className="mt-2 text-small text-faint">Letzte 24 Stunden · jede Säule = 1 Stunde</p>
  </div>
);

// ─────────────────────────────────────────────────────────────
// Картка «Vertretungsplan läuft» (макети 40 і 42): стан, час, сервер, 24 години.
// withButton — кнопка «Plan jetzt neu laden» усередині (телефон; на ПК вона в шапці)
// ─────────────────────────────────────────────────────────────
const PlanHealthCard = ({ overview, baseUrl, classCount, withButton }) => {
  const { plan } = overview;
  const state = planHealth(plan);
  const health = HEALTH[state];
  const refresh = usePlanRefresh();
  const server = serverLine(baseUrl, classCount, plan.hours);

  return (
    <div className="rounded-card bg-card p-3.5 lg:p-3.5">
      <div className="flex items-center gap-2">
        <span className={cn("size-2.5 shrink-0 rounded-full", health.dot)} />
        <p className="min-w-0 flex-1 truncate text-subhead font-extrabold text-ink">{health.title}</p>
        <Badge variant={CHIP[state]}>{health.chip}</Badge>
      </div>
      <p className="mt-2 text-body-sm text-muted">{planTimesText(plan.status)}</p>
      {server && <p className="text-body-sm text-muted">{server}</p>}
      {state === "error" && plan.lastError && <p className="mt-1 text-body-sm text-danger">{plan.lastError}</p>}
      <div className="mt-3">
        <HoursStrip hours={plan.hours} />
      </div>
      {withButton && (
        <PillButton glass="glass" size="md" disabled={refresh.busy} onClick={refresh.run} className="mt-3.5 flex h-10.5 w-full items-center justify-center gap-2 rounded-full bg-sand lg:hidden text-row font-extrabold text-ink disabled:opacity-50">
          <RenewIcon className={cn("size-4", refresh.busy && "animate-spin")} /> Plan jetzt neu laden
        </PillButton>
      )}
    </div>
  );
};

export default PlanHealthCard;
