import { cn } from "../../shared/utils/cn";
import { boxCounts } from "../../shared/utils/karten";
import { BOX_SHADES } from "./shades";


// Полоска «Lernstand» под стопкой: доли коробок 1…5. При появлении заливается слева направо
const LernstandBar = ({ deck, className, delay = 0 }) => {
  const counts = boxCounts(deck);
  const total = counts.reduce((a, b) => a + b, 0);
  return (
    <div className={cn("flex h-1.5 overflow-hidden rounded-full bg-sand", className)} aria-hidden="true">
      {total > 0 && (
        <div className="flex h-full w-full origin-left motion-safe:animate-bar-fill" style={{ animationDelay: `${delay}ms` }}>
          {counts.map((n, i) => (n > 0 ? <span key={i} className={cn("h-full", BOX_SHADES[i])} style={{ width: `${(n / total) * 100}%` }} /> : null))}
        </div>
      )}
    </div>
  );
};

export default LernstandBar;
