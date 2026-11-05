import { cn } from "../../shared/utils/cn";

// Перемикач з макета. role="switch": скрінрідер читає «увімкнено / вимкнено».
const Switch = ({ checked, onChange, label, className }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={() => onChange(!checked)}
    className={cn("flex h-6 w-10.5 shrink-0 items-center rounded-full p-0.5 transition-colors", checked ? "justify-end bg-accent" : "justify-start bg-switch-off", className)}
  >
    <span className={cn("size-5 rounded-full", checked ? "bg-switch-thumb" : "bg-white")} />
  </button>
);

export default Switch;
