import { useT } from "../../shared/hooks/useT";
import { cn } from "../../shared/utils/cn";
import { SIZE_LABELS } from "../../shared/utils/startBlocks";

// Какие из четырёх квадратиков закрашены: Klein — один, Breit — верхний ряд, Groß — все
const FILLED = { klein: [0], breit: [0, 1], gross: [0, 1, 2, 3] };

// Схема размера 2×2: закрашены клетки, которые блок занимает. small — для панели на блоке в «Anpassen»
export const SizeIcon = ({ size, small = false, active = true }) => (
  <span className="grid grid-cols-2 gap-px" aria-hidden="true">
    {[0, 1, 2, 3].map((i) => (
      <span key={i} className={cn(small ? "size-1.5 rounded-tick" : "size-4 rounded-mark", FILLED[size].includes(i) ? (active ? "bg-accent" : "bg-faint") : "bg-hair")} />
    ))}
  </span>
);

// Плитка размера в шторке блока (макет handy-03): схема 2×2 и подпись
const SizeTile = ({ size, selected, disabled, onSelect }) => {
  const t = useT();
  return (
    <button
      type="button"
      onClick={() => onSelect(size)}
      disabled={disabled}
      aria-pressed={selected}
      className={cn(
        "flex flex-1 flex-col items-center gap-2.5 rounded-field border-2 py-3.5 transition-colors disabled:opacity-40",
        selected ? "border-accent bg-tint" : "border-hair bg-card",
      )}
    >
      <SizeIcon size={size} />
      <span className={cn("text-body-sm font-bold", selected ? "text-ink" : "text-muted")}>{t(SIZE_LABELS[size])}</span>
    </button>
  );
};

export default SizeTile;
