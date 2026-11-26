import { Shirt, Sun, Umbrella, Wind } from "lucide-react";
import { cn } from "../../shared/utils/cn";

// Совет → значок (Mütze & Schal — ветер/холод: в lucide нет шапки)
const ICONS = { regenjacke: Umbrella, jacke: Shirt, muetze: Wind, sonnencreme: Sun };

// Плашки «что надеть» (weatherTips): фиолетовые, из-за погоды. small — в карточке «Tag»
const TipChips = ({ tips, small = false, className }) => (
  <div className={cn("flex flex-wrap gap-1.5", className)}>
    {tips.map((tip) => {
      const Icon = ICONS[tip.key];
      return (
        <span key={tip.key} className={cn("inline-flex items-center gap-1.5 rounded-full bg-tint font-extrabold whitespace-nowrap text-accent-ink", small ? "h-6 px-2.5 text-note" : "h-7 px-2.5 text-hint")}>
          {Icon && <Icon aria-hidden="true" className={small ? "size-3.5" : "size-3.75"} strokeWidth={2.2} />}
          {tip.label}
        </span>
      );
    })}
  </div>
);

export default TipChips;
