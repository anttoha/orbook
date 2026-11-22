import { useT } from "../../shared/hooks/useT";
import { cn } from "../../shared/utils/cn";
import { BOX_SHADES } from "./shades";

const LABELS = ["Neu", "2", "3", "4", "Sicher"];

// ─────────────────────────────────────────────────────────────
// «Lernstand»: 5 коробок Leitner столбиками (макет 43 handy-02, handy-05).
// counts — сколько карточек в каждой; moved — на сколько изменилось после «Lernen» (+3 / −3), иначе null.
// Столбики вырастают снизу по очереди, число над столбиком «прыгает», когда меняется (key)
// ─────────────────────────────────────────────────────────────
const BoxesCard = ({ counts, moved = null, className }) => {
  const t = useT();
  const max = Math.max(1, ...counts);
  return (
    <div className={cn("grid grid-cols-5 gap-2.5 rounded-card bg-card px-4 pt-4 pb-3", className)}>
      {counts.map((n, i) => (
        <div key={i} className="flex flex-col items-center gap-2">
          <span className="flex items-baseline gap-1">
            <span key={n} className="text-row font-extrabold text-ink tabular-nums motion-safe:animate-count-pop">
              {n}
            </span>
            {moved?.[i] ? (
              <span className={cn("text-micro font-extrabold motion-safe:animate-done-pop", moved[i] > 0 ? "text-ok" : "text-danger")} style={{ animationDelay: `${500 + i * 60}ms` }}>
                {moved[i] > 0 ? `+${moved[i]}` : `−${-moved[i]}`}
              </span>
            ) : null}
          </span>
          <div className="flex h-16 w-full items-end overflow-hidden rounded-tile bg-sand">
            <div
              className={cn("w-full origin-bottom rounded-tile transition-[height] duration-700 ease-soft motion-safe:animate-bar-grow", BOX_SHADES[i])}
              style={{ height: `${(n / max) * 100}%`, animationDelay: `${i * 70}ms` }}
            />
          </div>
          <span className="text-caption font-bold text-faint">{t(LABELS[i])}</span>
        </div>
      ))}
    </div>
  );
};

export default BoxesCard;
