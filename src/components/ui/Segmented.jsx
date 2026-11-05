import { cn } from "../../shared/utils/cn";

// ─────────────────────────────────────────────────────────────
// Перемикач «Liste | Zeitleiste», «Heute | Morgen | Woche».
// options: [{ value, label, icon? }], value — вибране, onChange(value)
// variant: "card" — вибраний білий (телефон), "accent" — вибраний фіолетовий (ПК)
// size: "md" — уся смуга 38px, "sm" — 34px (компактний, як у шапці на ПК)
// iconOnly — показувати тільки іконки (підпис іде в aria-label)
// ─────────────────────────────────────────────────────────────
const Segmented = ({ options, value, onChange, label, className, variant = "card", size = "md", iconOnly = false }) => {
  return (
    // role="group" + aria-label — скрінрідер прочитає, що це за перемикач
    <div role="group" aria-label={label} className={cn("flex rounded-full bg-sand p-0.75", className)}>
      {options.map((option) => {
        const active = option.value === value; // чи вибраний цей варіант
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active} // чи «натиснута» кнопка — для скрінрідера
            aria-label={iconOnly ? option.label : undefined} // підпис для варіанта «тільки іконки»
            title={iconOnly ? option.label : undefined}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-full font-extrabold whitespace-nowrap transition-colors",
              size === "sm" ? "h-7 px-3 text-label" : "h-8 px-3 text-hint",
              active
                ? variant === "accent"
                  ? "bg-accent text-on-accent" // ПК: фіолетова «пігулка»
                  : "bg-card text-ink shadow-lift" // телефон: біла «пігулка»
                : "text-muted hover:text-ink",
            )}
          >
            {option.icon && <option.icon className="size-3.75 shrink-0" />}
            {!iconOnly && option.label}
          </button>
        );
      })}
    </div>
  );
};

export default Segmented;
