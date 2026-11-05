import { cn } from "../../shared/utils/cn";
import { fachBorderClass, fachClasses, fachDotClass } from "../../shared/utils/lessons";

// Предмет-перемикач: вибраний — у своєму кольорі з рамкою. large — товстіша рамка у формі запису
const SubjectToggle = ({ code, label, selected, overrides, large = false, onClick }) => (
  <button
    type="button"
    aria-pressed={selected}
    onClick={onClick}
    className={cn(
      "flex items-center gap-1.75 rounded-full border px-3 text-label font-bold text-ink",
      large ? "h-9.5" : "h-9",
      selected ? cn(fachClasses(code, overrides), fachBorderClass(code, overrides), "text-ink", large && "border-2") : "border-rule",
    )}
  >
    <span className={cn("size-2 rounded-full", fachDotClass(code, overrides))} />
    {label}
  </button>
);

export default SubjectToggle;
