import { PALETTES, SWATCH_ORDER } from "../../shared/constants/fachColors";
import { useUserStore } from "../../shared/store/userStore";
import { cn } from "../../shared/utils/cn";
import { fachClasses } from "../../shared/utils/lessons";
import { CheckIcon } from "../ui/icons";

// Картка «Mathe · Farbe wählen». Прилипає до верху: у школи предметів більше, ніж вміщує екран,
// і без цього колір довелося б вибирати, не бачачи його.
// Зверху — значок і назва вибраного предмета: одразу видно, кому міняємо колір
const ColorPalette = ({ subject, current, onPick }) => {
  const overrides = useUserStore((s) => s.colorOverrides);

  return (
    <div className="sticky top-2 z-10 rounded-card bg-card px-3.5 pt-3.5 pb-3.5 shadow-raise">
      <div className="mb-3 flex items-center gap-2.5">
        <span className={cn("grid size-8 shrink-0 place-items-center rounded-full text-note font-black", fachClasses(subject.code, overrides))}>{subject.code}</span>
        <p className="min-w-0 flex-1 truncate text-row font-extrabold text-ink">{subject.name}</p>
        <p className="shrink-0 text-hint font-extrabold text-faint">Farbe wählen</p>
      </div>
      <div className="flex flex-wrap gap-2.5">
        {SWATCH_ORDER.map((key) => (
          <button
            key={key}
            type="button"
            aria-label={PALETTES[key].label}
            aria-pressed={key === current}
            onClick={() => onPick(key)}
            className={cn("grid size-8.5 place-items-center rounded-full text-white", PALETTES[key].solid, key === current && "ring-3 ring-ink ring-offset-2 ring-offset-card")}
          >
            {key === current && <CheckIcon className="size-4" />}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ColorPalette;
