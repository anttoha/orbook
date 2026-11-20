import { cn } from "../../shared/utils/cn";
import { gradeTone } from "../../shared/utils/noten";

// Цвет плашки оценки (решение владельца): ≤ 2,5 зелёная, > 3,5 красная, между — песочная
const TONES = { good: "bg-ok-tint text-ok", bad: "bg-danger-tint text-danger", mid: "bg-sand text-ink", none: "bg-sand text-muted" };

// Плашка оценки: «2,1» (Schnitt) или «3+» (как в InfoPoint). value — число для цвета
const GradePill = ({ text, value, className }) => (
  <span className={cn("grid h-8.5 min-w-13 shrink-0 place-items-center rounded-tile px-2 text-subhead", TONES[gradeTone(value)], className)}>{text}</span>
);

export default GradePill;
