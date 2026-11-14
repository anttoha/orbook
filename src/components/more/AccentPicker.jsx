import { Check } from "lucide-react";
import { useT } from "../../shared/hooks/useT";
import { cn } from "../../shared/utils/cn";
import Liquid from "../ui/Liquid";

const ACCENTS = [
  { value: "violett", label: "Violett" },
  { value: "blau", label: "Blau" },
  { value: "gruen", label: "Grün" },
  { value: "orange", label: "Orange" },
  { value: "pink", label: "Pink" },
  { value: "grafit", label: "Grafit" },
];

// Akzentfarbe: шесть кружков. data-accent на кружке включает токены этого цвета только в нём,
// поэтому кружок красится тем же классом bg-accent, что и кнопки
const AccentPicker = ({ value, onChange }) => {
  const t = useT();
  return (
    <Liquid as="div" refract press={false} role="radiogroup" aria-label={t("Akzentfarbe")} className="flex items-center justify-between rounded-card bg-card px-3.5 py-3">
      {ACCENTS.map((accent) => {
        const on = accent.value === value;
        return (
          <button
            key={accent.value}
            type="button"
            role="radio"
            aria-checked={on}
            aria-label={t(accent.label)}
            title={t(accent.label)}
            data-accent={accent.value}
            onClick={() => onChange(accent.value)}
            className={cn("grid size-10 place-items-center rounded-full", on && "ring-2 ring-accent ring-offset-2 ring-offset-card")}
          >
            <span className="grid size-8 place-items-center rounded-full bg-accent text-on-accent">{on && <Check className="size-4" strokeWidth={3} />}</span>
          </button>
        );
      })}
    </Liquid>
  );
};

export default AccentPicker;
