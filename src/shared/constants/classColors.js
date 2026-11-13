// ─────────────────────────────────────────────────────────────
// Цвета классов (часть 29, «Klasse einstellen» → Farbe). Те же токены, что у Fachfarben, плюс фиолетовый акцент:
// новых цветов нет. Порядок — как кружочки на макете handy-07.
//   tint  — значок класса «9b» (светлый фон + текст), solid — кружочек выбора
// ─────────────────────────────────────────────────────────────
import { PALETTES } from "./fachColors";

const fromPalette = (key) => ({ tint: PALETTES[key].tint, solid: PALETTES[key].solid, label: PALETTES[key].label });

export const CLASS_COLORS = {
  accent: { tint: "bg-tint text-accent-ink", solid: "bg-accent", label: "Violett" },
  englisch: fromPalette("englisch"),
  biologie: fromPalette("biologie"),
  mathe: fromPalette("mathe"),
  deutsch: fromPalette("deutsch"),
  physik: fromPalette("physik"),
  geschichte: fromPalette("geschichte"),
  kunst: fromPalette("kunst"),
};

// Неизвестный ключ (например, из старой версии) — акцент
export const classColor = (key) => CLASS_COLORS[key] ?? CLASS_COLORS.accent;
