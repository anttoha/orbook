import SubjectBadge from "../ui/SubjectBadge";
import { PALETTES, SWATCH_ORDER } from "../../shared/constants/fachColors";
import { cn } from "../../shared/utils/cn";
import { CheckIcon } from "../ui/icons";

// Картка «Mathe · Farbe wählen». Прилипає до верху: у школи предметів більше, ніж вміщує екран,
// і без цього колір довелося б вибирати, не бачачи його.
// Зверху — значок і назва вибраного предмета: одразу видно, кому міняємо колір
const ColorPalette = ({ subject, current, onPick }) => {
  return (
    <div className="sticky top-2 z-10 rounded-card bg-card px-3.5 pt-3.5 pb-3.5 shadow-raise">
      <div className="mb-3 flex items-center gap-3">
        <SubjectBadge subject={subject} size="lg" />
        <div className="min-w-0">
          <p className="truncate text-subhead text-ink">{subject.name}</p>
          {/* назва кольору словами: видно й тим, хто погано розрізняє кольори */}
          <p className="text-hint font-extrabold text-faint">Farbe wählen · {PALETTES[current]?.label}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2.5">
        {/* рамка «перетікає»: у невибраних вона та сама, але прозора й нульова, тому браузер плавно міняє і колір, і товщину */}
        {SWATCH_ORDER.map((key) => (
          <button
            key={key}
            type="button"
            aria-label={PALETTES[key].label}
            aria-pressed={key === current}
            onClick={() => onPick(key)}
            className={cn("grid size-8.5 place-items-center rounded-full text-white ring-offset-2 ring-offset-card transition-shadow duration-150", PALETTES[key].solid, key === current ? "ring-3 ring-ink" : "ring-0 ring-transparent hover:ring-2 hover:ring-hair")}
          >
            {key === current && <CheckIcon className="size-4 motion-safe:animate-pop-in" />}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ColorPalette;
