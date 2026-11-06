import { cn } from "../../../shared/utils/cn";

// Рядок налаштування: назва (і підказка) ліворуч, перемикач або список праворуч.
// invalid — сервер не прийняв значення (422): підказку замінює червоний текст
const OptionRow = ({ label, hint, invalid = false, children }) => (
  <div className="flex min-h-16.75 items-center justify-between gap-3 py-2.5">
    <div className="min-w-0">
      <p className="text-row text-ink">{label}</p>
      {(hint || invalid) && <p className={cn("mt-0.5 text-caption", invalid ? "text-danger" : "text-faint")}>{invalid ? "Dieser Wert ist nicht erlaubt." : hint}</p>}
    </div>
    {children}
  </div>
);

export default OptionRow;
