import { Check } from "lucide-react";
import { cn } from "../../shared/utils/cn";

// Галочка з підписом (права коду: «Klausuren eintragen» …). Справжній <input>, тому працює з клавіатури
const Checkbox = ({ checked, onChange, label, disabled = false }) => (
  <label className={cn("flex min-h-11 cursor-pointer items-center gap-3.5 text-row text-ink", disabled && "cursor-default opacity-50")}>
    <input type="checkbox" className="peer sr-only" checked={checked} disabled={disabled} onChange={(event) => onChange(event.target.checked)} />
    <span
      aria-hidden="true"
      className={cn(
        "grid size-5 shrink-0 place-items-center rounded-tick border-2 transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-accent/50",
        checked ? "border-accent bg-accent text-on-accent" : "border-faint2 bg-card",
      )}
    >
      {checked && <Check className="size-3.5" strokeWidth={3} />}
    </span>
    {label}
  </label>
);

export default Checkbox;
