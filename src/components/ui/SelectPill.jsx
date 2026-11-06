import { ChevronDown } from "lucide-react";
import { cn } from "../../shared/utils/cn";

// Маленький випадаючий список-«пігулка»: «5 min ⌄», «9b ⌄» (макети 45 і 47).
// Справжній <select>: на телефоні відкривається системний вибір.
// options — [{ value, label }]; значення може бути числом — повертаємо того самого типу
const SelectPill = ({ value, options, onChange, label, invalid = false, disabled = false }) => (
  <span className="relative inline-flex shrink-0">
    <select
      aria-label={label}
      aria-invalid={invalid}
      disabled={disabled}
      value={String(value ?? "")}
      onChange={(event) => onChange(options.find((o) => String(o.value) === event.target.value)?.value)}
      className={cn(
        "h-8.5 cursor-pointer appearance-none rounded-full border bg-card pr-7 pl-3 text-label font-extrabold text-ink outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:opacity-50",
        invalid ? "border-danger" : "border-rule",
      )}
    >
      {options.map((option) => (
        <option key={String(option.value)} value={String(option.value)}>
          {option.label}
        </option>
      ))}
    </select>
    <ChevronDown aria-hidden="true" className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2 text-muted" />
  </span>
);

export default SelectPill;
