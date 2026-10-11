// ─────────────────────────────────────────────────────────────
// Кольори предметів. Є 8 «палітр» (кольори з Figma, задані в index.css).
// Повні рядки класів — бо Tailwind не знаходить класи, зібрані як `bg-${name}-tint`.
// ─────────────────────────────────────────────────────────────

// Палітри: tint — світла плашка (фон + текст), solid — насичений колір (кружки), label — назва кольору
export const PALETTES = {
  deutsch: { tint: "bg-deutsch-tint text-deutsch-text", solid: "bg-deutsch-solid", label: "Rosa" },
  mathe: { tint: "bg-mathe-tint text-mathe-text", solid: "bg-mathe-solid", label: "Blau" },
  englisch: { tint: "bg-englisch-tint text-englisch-text", solid: "bg-englisch-solid", label: "Orange" },
  physik: { tint: "bg-physik-tint text-physik-text", solid: "bg-physik-solid", label: "Türkis" },
  geschichte: { tint: "bg-geschichte-tint text-geschichte-text", solid: "bg-geschichte-solid", label: "Gold" },
  kunst: { tint: "bg-kunst-tint text-kunst-text", solid: "bg-kunst-solid", label: "Lila" },
  sport: { tint: "bg-sport-tint text-sport-text", solid: "bg-sport-solid", label: "Grau" },
  biologie: { tint: "bg-biologie-tint text-biologie-text", solid: "bg-biologie-solid", label: "Grün" },
};

// Код предмета зі шкільного плану (subject.code) → палітра за замовчуванням (як у дизайні).
// У даних школи біологія має код "Bi" (не "Bio").
export const DEFAULT_PALETTE = {
  De: "deutsch",
  Ma: "mathe",
  En: "englisch",
  Ph: "physik",
  Ge: "geschichte",
  Ku: "kunst",
  Sp: "sport",
  Bi: "biologie",
};
