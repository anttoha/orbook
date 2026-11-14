import { GlassButton } from "@zakisheriff/liquid-glass";
import { useGlass } from "../../shared/hooks/useGlass";
import { useT } from "../../shared/hooks/useT";
import { cn } from "../../shared/utils/cn";

// ─────────────────────────────────────────────────────────────
// Выбор одного из многих «таблетками», которые переносятся на новую строку.
// Для списков, которые не влезают в Segmented (виды тестов: «Klassenarbeit», «Leistungskontrolle» …).
// options: [{ value, label }], value — выбранное, onChange(value)
// ─────────────────────────────────────────────────────────────
const ChoiceChips = ({ options, value, onChange, label }) => {
  const t = useT();
  const glass = useGlass();
  // «Glas»: каждая таблетка — кнопка библиотеки; выбранная залита акцентом
  if (glass) {
    return (
      <div role="group" aria-label={label && t(label)} className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = option.value === value;
          return (
            <GlassButton key={option.value} size="sm" aria-pressed={active} variant={active ? "filled" : "glass"} tint="var(--color-accent)" onClick={() => onChange(option.value)}>
              {t(option.label)}
            </GlassButton>
          );
        })}
      </div>
    );
  }
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
