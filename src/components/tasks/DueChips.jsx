import { useRef } from "react";
import { cn } from "../../shared/utils/cn";
import { isIsoDate, numericDate, weekdayShort } from "../../shared/utils/format";
import { dueChoices } from "../../shared/utils/tasks";
import { CalendarIcon } from "../ui/icons";
import ChipButton from "../ui/ChipButton";

const chip = "h-10 rounded-full border px-4 text-label font-bold outline-none transition-[background-color,border-color,color,scale] duration-200 focus-visible:ring-2 focus-visible:ring-accent/50 active:scale-95";
const on = "border-accent bg-accent text-on-accent";
const off = "border-rule text-muted";

// «Bis wann?» (макет handy-03): Morgen · следующий учебный день · Ohne Datum · календарь.
// Выбранная в календаре дата становится своим чипом вместо значка
const DueChips = ({ value, today, onChange }) => {
  const picker = useRef(null); // скрытое поле даты: кнопка с календарём открывает его
  const choices = dueChoices(today);
  const custom = value && !choices.some((c) => c.value === value);

  const openPicker = () => {
    try {
      picker.current.showPicker();
    } catch {
      picker.current.focus(); // старые браузеры: хотя бы фокус
    }
  };

  return (
    <div role="radiogroup" aria-label="Bis wann?" className="flex flex-wrap items-center gap-2">
      {[...choices, { label: "Ohne Datum", value: null }].map((c) => (
        <ChipButton key={c.label} role="radio" aria-checked={value === c.value} onClick={() => onChange(c.value)} on={value === c.value} look={cn(chip, value === c.value ? on : off)}>
          {c.label}
        </ChipButton>
      ))}
      <ChipButton onClick={openPicker} aria-label="Anderes Datum" on={Boolean(custom)} look={cn(chip, "flex items-center gap-1.5", custom ? on : cn(off, "w-10 justify-center px-0"))}>
        <CalendarIcon className="size-4 shrink-0" />
        {custom && `${weekdayShort(value)} ${numericDate(value)}`}
      </ChipButton>
      <input ref={picker} type="date" min={today} value={value ?? ""} onChange={(e) => isIsoDate(e.target.value) && onChange(e.target.value)} aria-label="Datum" tabIndex={-1} className="sr-only" />
    </div>
  );
};

export default DueChips;
