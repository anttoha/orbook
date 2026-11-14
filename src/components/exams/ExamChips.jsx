import { useUserStore } from "../../shared/store/userStore";
import { cn } from "../../shared/utils/cn";
import { fachDotClass } from "../../shared/utils/lessons";
import { FilterIcon } from "../ui/icons";
import RoundButton from "../ui/RoundButton";
import ChipButton from "../ui/ChipButton";

const chip = "flex h-8.25 shrink-0 items-center gap-1.5 rounded-full border px-3 text-hint font-bold outline-none focus-visible:ring-2 focus-visible:ring-accent/50";
const chipOn = "border-accent bg-accent text-on-accent";
const chipOff = "border-rule text-muted";

// ─────────────────────────────────────────────────────────────
// Ряд над списком: Alle · Ma · De · En … і кнопка фільтра в кінці (гортається пальцем).
// codes — коди предметів, selected — вибрані, filterActive — у фільтрі щось вибрано.
// Без onOpenFilter кнопки фільтра немає (на ПК вона в шапці сторінки)
// ─────────────────────────────────────────────────────────────
const ExamChips = ({ codes, selected, filterActive, onAll, onToggle, onOpenFilter }) => {
  const overrides = useUserStore((s) => s.colorOverrides); // свої кольори предметів

  return (
    <div className="no-scrollbar -mx-gutter flex min-w-0 items-center gap-1.75 overflow-x-auto px-gutter py-px lg:mx-0 lg:px-0">
      <ChipButton aria-pressed={selected.length === 0} onClick={onAll} on={selected.length === 0} look={cn(chip, selected.length === 0 ? chipOn : chipOff)}>
        Alle
      </ChipButton>
      {codes.map((code) => {
        const active = selected.includes(code);
        return (
          <ChipButton key={code} aria-pressed={active} onClick={() => onToggle(code)} on={active} look={cn(chip, active ? chipOn : chipOff)}>
            <span className={cn("size-1.75 rounded-full", fachDotClass(code, overrides))} />
            {code}
          </ChipButton>
        );
      })}
      {/* вид і період у ряду не видно, тому кнопка сама показує, що фільтр увімкнено */}
      {onOpenFilter && (
        <RoundButton
          aria-label="Filter"
          onClick={onOpenFilter} look={cn("grid size-8.5 shrink-0 place-items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-accent/50", filterActive ? "bg-tint text-accent-ink" : "bg-card text-ink")}>
          <FilterIcon className="size-4.25" />
        </RoundButton>
      )}
    </div>
  );
};

export default ExamChips;
