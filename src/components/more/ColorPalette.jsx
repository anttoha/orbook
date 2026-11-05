import { PALETTES, SWATCH_ORDER } from "../../shared/constants/fachColors";
import { cn } from "../../shared/utils/cn";

// Картка «Mathe · Farbe wählen». Прилипає до верху: у школи предметів більше, ніж вміщує екран,
// і без цього колір довелося б вибирати, не бачачи його.
const ColorPalette = ({ subjectName, current, onPick }) => (
  <div className="sticky top-2 z-10 rounded-card bg-card px-3.5 pt-3.5 pb-3.5">
    <p className="mb-3 truncate text-hint font-extrabold text-faint">{subjectName} · Farbe wählen</p>
    <div className="flex flex-wrap gap-2.5">
      {SWATCH_ORDER.map((key) => (
        <button
          key={key}
          type="button"
          aria-label={PALETTES[key].label}
          aria-pressed={key === current}
          onClick={() => onPick(key)}
          className={cn("size-8.5 rounded-full", PALETTES[key].solid, key === current && "ring-3 ring-ink ring-offset-2 ring-offset-card")}
        />
      ))}
    </div>
  </div>
);

export default ColorPalette;
