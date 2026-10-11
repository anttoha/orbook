import { Check } from "lucide-react";
import { PALETTES } from "../../shared/constants/fachColors";
import { usePlanStore } from "../../shared/store/planStore";
import { useUserStore } from "../../shared/store/userStore";
import { cn } from "../../shared/utils/cn";
import { paletteOf } from "../../shared/utils/lessons";
import Button from "../ui/Button";
import Sheet from "../ui/Sheet";

// ─────────────────────────────────────────────────────────────
// Шторка «Fachfarbe ändern». Адреса: ?sheet=farbe&fach=Ma (код предмета)
// Вибираємо одну з 8 палітр — предмет малюватиметься нею (тільки на цьому пристрої).
// ─────────────────────────────────────────────────────────────
const ColorSheet = ({ open, onClose, sheet }) => {
  const overrides = useUserStore((s) => s.colorOverrides); // свої кольори
  const setFachColor = useUserStore((s) => s.setFachColor); // змінити колір
  const subjects = usePlanStore((s) => s.meta?.subjects); // назви предметів { Ma: "Mathe" }

  const code = sheet.fach; // для якого предмета
  if (!code) return null; // крива адреса

  const current = paletteOf(code, overrides); // вибрана зараз палітра

  // Вибрати палітру і закрити
  const choose = (palette) => {
    setFachColor(code, palette);
    onClose();
  };

  return (
    <Sheet
      open={open}
      onClose={onClose}
      panelLabel="Fachfarbe"
      eyebrow={subjects?.[code] ?? code}
      title="Fachfarbe ändern"
      footer={<Button onClick={() => choose(null)}>Standardfarbe</Button>}
    >
      {/* сітка 4×2 кольорових кружечків */}
      <div className="grid grid-cols-4 gap-3">
        {Object.entries(PALETTES).map(([key, palette]) => (
          <button
            key={key}
            type="button"
            aria-pressed={key === current} // чи вибраний цей колір
            onClick={() => choose(key)}
            className="flex flex-col items-center gap-1.5 rounded-2xl py-2 transition-colors hover:bg-sand"
          >
            <span className={cn("grid size-11 place-items-center rounded-full text-white", palette.solid, key === current && "ring-3 ring-accent ring-offset-2 ring-offset-paper")}>
              {key === current && <Check className="size-5" strokeWidth={3} />}
            </span>
            <span className="text-small font-bold text-muted">{palette.label}</span>
          </button>
        ))}
      </div>
    </Sheet>
  );
};

export default ColorSheet;
