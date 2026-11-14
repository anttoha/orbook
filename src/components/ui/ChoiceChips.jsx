import { useT } from "../../shared/hooks/useT";
import { cn } from "../../shared/utils/cn";

// ─────────────────────────────────────────────────────────────
// Выбор одного из многих «таблетками», которые переносятся на новую строку.
// Для списков, которые не влезают в Segmented (виды тестов: «Klassenarbeit», «Leistungskontrolle» …).
// options: [{ value, label }], value — выбранное, onChange(value)
// ─────────────────────────────────────────────────────────────
const ChoiceChips = ({ options, value, onChange, label }) => {
  const t = useT();
  return (
    <div role="group" aria-label={label && t(label)} className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "h-8.25 rounded-full border px-3.5 text-hint font-bold outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-accent/50",
              active ? "border-accent bg-accent text-on-accent" : "border-rule text-muted active:bg-sand",
            )}
          >
            {t(option.label)}
          </button>
        );
      })}
    </div>
  );
};

export default ChoiceChips;
