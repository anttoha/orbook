import { cn } from "../../shared/utils/cn";
import ChipButton from "../ui/ChipButton";

const chip = "h-11 rounded-full border px-4.5 text-body-sm font-bold outline-none focus-visible:ring-2 focus-visible:ring-accent/50";

// Выбор вида записи (Art) чипами, как в макете 24 handy-04: виды бывают длинные, поэтому переносятся.
// types — [{ name, short }] из meta.examTypeList
const TypeChips = ({ types, value, onChange }) => (
  <div role="radiogroup" aria-label="Art" className="flex flex-wrap gap-2">
    {types.map((type) => (
      <ChipButton key={type.name} role="radio" aria-checked={value === type.name} onClick={() => onChange(type.name)} on={value === type.name} look={cn(chip, value === type.name ? "border-accent bg-accent text-on-accent" : "border-rule text-muted")}>
        {type.name}
      </ChipButton>
    ))}
  </div>
);

export default TypeChips;
