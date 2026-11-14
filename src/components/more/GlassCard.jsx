import Segmented from "../ui/Segmented";
import { useT } from "../../shared/hooks/useT";
import { cn } from "../../shared/utils/cn";

const BACKGROUNDS = [
  { value: "aurora", label: "Aurora" },
  { value: "abendrot", label: "Abendrot" },
  { value: "meer", label: "Meer" },
  { value: "wald", label: "Wald" },
];
const MODES = [
  { value: "voll", label: "Voll" },
  { value: "einfach", label: "Einfach" },
];

// Только для Glas: фон под стеклом и «Glas-Effekt» (Einfach — без размытия, для слабых телефонов).
// Образец фона рисует тот же класс glass-backdrop, что и настоящий фон, с data-glass-bg на самом образце
const GlassCard = ({ glassBg, glassMode, onBg, onMode }) => {
  const t = useT();
  return (
    <section>
      <h2 className="mb-2.5 text-hint font-extrabold text-faint">{t("Hintergrund")}</h2>
      <div className="rounded-card bg-card px-3.5">
        <div role="radiogroup" aria-label={t("Hintergrund")} className="grid grid-cols-4 gap-2 py-3.5">
          {BACKGROUNDS.map((bg) => {
            const on = bg.value === glassBg;
            return (
              <button key={bg.value} type="button" role="radio" aria-checked={on} onClick={() => onBg(bg.value)} className="min-w-0">
                <span
                  data-design="glas"
                  data-glass-bg={bg.value}
                  className={cn("glass-backdrop block h-12 rounded-tile", on && "ring-2 ring-accent ring-offset-2 ring-offset-card")}
                />
                <span className={cn("mt-1.5 block truncate text-caption", on ? "font-extrabold text-ink" : "font-semibold text-muted")}>{t(bg.label)}</span>
              </button>
            );
          })}
        </div>
        <div className="flex h-16.75 items-center justify-between gap-3 border-t border-hair">
          <p className="text-row text-ink">{t("Glas-Effekt")}</p>
          <Segmented label="Glas-Effekt" size="form" className="w-fit" options={MODES} value={glassMode} onChange={onMode} />
        </div>
      </div>
    </section>
  );
};

export default GlassCard;
