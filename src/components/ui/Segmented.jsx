import { GlassSegmented } from "@zakisheriff/liquid-glass";
import { useGlass } from "../../shared/hooks/useGlass";
import { useT } from "../../shared/hooks/useT";
import { cn } from "../../shared/utils/cn";

// ─────────────────────────────────────────────────────────────
// Перемикач «Liste | Zeitleiste», «Heute | Morgen | Woche».
// options: [{ value, label, icon? }], value — вибране, onChange(value)
// variant: "card" — вибраний білий (телефон), "accent" — вибраний фіолетовий (ПК)
// size: "md" — уся смуга 38px, "form" — 35px (вікно фільтра), "sm" — 34px (компактний, як у шапці на ПК)
// iconOnly — показувати тільки іконки (підпис іде в aria-label)
//
// Вибрана «пігулка» — один окремий блок під кнопками. Він плавно їде до нового варіанта,
// а не з'являється одразу. Тому кнопки однакової ширини (grid auto-cols-fr): зсув = номер × ширина
// ─────────────────────────────────────────────────────────────
// Висота кнопки і текст для кожного розміру
const SIZES = { md: "h-8 px-3 text-hint", form: "h-7.25 px-3 text-hint", sm: "h-7 px-3 text-label" };

const Segmented = ({ options, value, onChange, label, className, variant = "card", size = "md", iconOnly = false }) => {
  const t = useT();
  const index = options.findIndex((option) => option.value === value); // котрий вибраний (-1 — жоден)
  const glass = useGlass();

  // «Glas»: перемикач із бібліотеки — вибране стає лінзою, її можна тягти.
  // Тільки іконки: підписи лишаються для скрінрідера, а на екрані сховані (клас orb-icons-only в index.css)
  if (glass) {
    return (
      <GlassSegmented
        aria-label={label && t(label)}
        className={cn(className, iconOnly && "orb-icons-only")}
        size={size === "sm" || iconOnly ? "sm" : "md"}
        value={Math.max(0, index)}
        onChange={(i) => onChange(options[i].value)}
        options={options.map((option) => (option.icon ? { label: t(option.label), icon: <option.icon className="size-3.75" /> } : t(option.label)))}
      />
    );
  }

  return (
    // role="group" + aria-label — скрінрідер прочитає, що це за перемикач
    <div role="group" aria-label={label && t(label)} className={cn("relative grid grid-flow-col auto-cols-fr rounded-full bg-sand p-0.75", className)}>
      {index >= 0 && (
        <span
          aria-hidden="true"
          className={cn(
            "absolute inset-y-0.75 left-0.75 rounded-full transition-[translate] duration-250 ease-out motion-reduce:transition-none",
            variant === "accent" ? "bg-accent" : "bg-card shadow-lift",
          )}
          // ширина однієї кнопки (смуга мінус відступи 2×3px), зсув — на index таких ширин
          style={{ width: `calc((100% - 0.375rem) / ${options.length})`, translate: `${index * 100}% 0` }}
        />
      )}
      {options.map((option) => {
        const active = option.value === value; // чи вибраний цей варіант
        return (
          <button
            key={option.value}
            type="button"
            data-no-press // «просідання» тут зайве: відгуком є сама пігулка, що їде
            aria-pressed={active} // чи «натиснута» кнопка — для скрінрідера
            aria-label={iconOnly ? t(option.label) : undefined} // підпис для варіанта «тільки іконки»
            title={iconOnly ? t(option.label) : undefined}
            onClick={() => onChange(option.value)}
            className={cn(
              "relative flex items-center justify-center gap-1.5 rounded-full font-extrabold whitespace-nowrap transition-colors duration-250",
              SIZES[size],
              active ? (variant === "accent" ? "text-on-accent" : "text-ink") : "text-muted hover:text-ink",
            )}
          >
            {option.icon && <option.icon className="size-3.75 shrink-0" />}
            {!iconOnly && t(option.label)}
          </button>
        );
      })}
    </div>
  );
};

export default Segmented;
