import { useUserStore } from "../../shared/store/userStore";
import { cn } from "../../shared/utils/cn";
import { fachDotClass } from "../../shared/utils/lessons";
import { FilterIcon } from "../ui/icons";

const chip = "flex h-8.25 shrink-0 items-center gap-1.5 rounded-full border px-3 text-hint font-bold outline-none focus-visible:ring-2 focus-visible:ring-accent/50";
const chipOn = "border-accent bg-accent text-on-accent";
const chipOff = "border-rule text-muted";

// ─────────────────────────────────────────────────────────────
// Ряд над списком: Alle · Ma · De · En … і кнопка фільтра в кінці (гортається пальцем).
// codes — коди предметів, selected — вибрані, filterActive — у фільтрі щось вибрано
// ─────────────────────────────────────────────────────────────
const ExamChips = ({ codes, selected, filterActive, onAll, onToggle, onOpenFilter }) => {
  const overrides = useUserStore((s) => s.colorOverrides); // свої кольори предметів

  return (
    <div className="no-scrollbar -mx-gutter flex items-center gap-1.75 overflow-x-auto px-gutter py-px lg:mx-0 lg:px-0">
      <button type="button" aria-pressed={selected.length === 0} onClick={onAll} className={cn(chip, selected.length === 0 ? chipOn : chipOff)}>
        Alle
      </button>
      {codes.map((code) => {
        const active = selected.includes(code);
        return (
          <button key={code} type="button" aria-pressed={active} onClick={() => onToggle(code)} className={cn(chip, active ? chipOn : chipOff)}>
            <span className={cn("size-1.75 rounded-full", fachDotClass(code, overrides))} />
            {code}
          </button>
        );
      })}
      {/* вид і період у ряду не видно, тому кнопка сама показує, що фільтр увімкнено */}
      <button
        type="button"
        aria-label="Filter"
        onClick={onOpenFilter}
        className={cn("grid size-8.5 shrink-0 place-items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-accent/50", filterActive ? "bg-tint text-accent-ink" : "bg-card text-ink")}
      >
        <FilterIcon className="size-4.25" />
      </button>
    </div>
  );
};

export default ExamChips;
