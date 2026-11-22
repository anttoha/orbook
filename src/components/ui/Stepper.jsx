import { Minus, Plus } from "lucide-react";
import { useT } from "../../shared/hooks/useT";

// ─────────────────────────────────────────────────────────────
// «−  25 min  +» (Lerntimer · Einstellungen, часть 44): песочная «пилюля» с двумя кнопками.
// onStep(-1 | 1) — шаг вниз/вверх; границы считает тот, кто вызывает. label — для скрінрідера
// ─────────────────────────────────────────────────────────────
const BTN = "grid size-9.5 place-items-center rounded-full text-ink outline-none transition-transform duration-150 focus-visible:ring-2 focus-visible:ring-accent/50 active:scale-85 disabled:opacity-30";

const Stepper = ({ value, label, onStep, canDown = true, canUp = true }) => {
  const t = useT();
  return (
    <div role="group" aria-label={label} className="flex h-9.5 w-34 shrink-0 items-center justify-between rounded-full bg-sand">
      <button type="button" className={BTN} onClick={() => onStep(-1)} disabled={!canDown} aria-label={t("Weniger")}>
        <Minus className="size-4.5" strokeWidth={2.2} />
      </button>
      <span key={value} className="text-body-sm font-extrabold text-ink tabular-nums motion-safe:animate-count-pop" aria-live="polite">
        {value}
      </span>
      <button type="button" className={BTN} onClick={() => onStep(1)} disabled={!canUp} aria-label={t("Mehr")}>
        <Plus className="size-4.5" strokeWidth={2.2} />
      </button>
    </div>
  );
};

export default Stepper;
